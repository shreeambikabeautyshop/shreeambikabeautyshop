"use client";
import { useState } from "react";
import Script from "next/script";

interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  qty: number;
}

interface Customer {
  full_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  pincode?: string;
}

interface Props {
  items:           CartItem[];
  customer:        Customer;
  subtotal:        number;   // ₹
  deliveryCharge:  number;   // ₹
  deliveryMode:    "pickup" | "delivery";
  deliveryPincode?: string;
  courierName?:    string;   // selected courier name
  courierDays?:    number;   // estimated delivery days
  onSuccess:       (receiptNo: string, paymentId: string) => void;
  onFailure?:      (error: string) => void;
  disabled?:       boolean;
}

// Extend Window for Razorpay
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string; amount: number; currency: string; name: string;
  description: string; order_id: string; prefill: Record<string, string>;
  notes: Record<string, string>; theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
}
interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id:   string;
  razorpay_signature:  string;
}
interface RazorpayInstance { open(): void; }

export default function RazorpayCheckout({
  items, customer, subtotal, deliveryCharge, deliveryMode,
  deliveryPincode, courierName, courierDays, onSuccess, onFailure, disabled,
}: Props) {
  const [loading,       setLoading]       = useState(false);
  const [scriptLoaded,  setScriptLoaded]  = useState(false);
  const [errorMsg,      setErrorMsg]      = useState("");

  const grandTotal = subtotal + deliveryCharge; // ₹
  const amountPaise = grandTotal * 100;          // paise

  const handlePayment = async () => {
    if (!scriptLoaded) {
      setErrorMsg("Payment gateway loading... please try again in a second.");
      return;
    }
    if (amountPaise < 100) {
      setErrorMsg("Minimum order amount is ₹1");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      // ── Step 1: Create Razorpay Order (server) ──
      const orderRes = await fetch("/api/create-order", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount:  amountPaise,
          currency: "INR",
          receipt: `SABS-${Date.now()}`,
          notes: {
            customer_name:  customer.full_name  || "",
            customer_phone: customer.phone      || "",
            delivery_mode:  deliveryMode,
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.order_id) {
        throw new Error(orderData.error || "Failed to create order");
      }

      // ── Step 2: Open Razorpay Modal ──
      const options: RazorpayOptions = {
        key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        "Shree Ambika Beauty Shop",
        description: `${items.length} product${items.length !== 1 ? "s" : ""} — ${deliveryMode === "pickup" ? "Store Pickup" : `Delivery to ${deliveryPincode || ""}` }`,
        order_id:    orderData.order_id,
        prefill: {
          name:    customer.full_name || "",
          contact: customer.phone    || "",
          email:   customer.email    || "",
        },
        notes: {
          delivery_mode:  deliveryMode,
          delivery_charge: String(deliveryCharge),
          subtotal:        String(subtotal),
        },
        theme: { color: "#C41E3A" }, // brand-primary

        // ── Step 3: On Payment Success ──
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                // Order details for receipt
                items,
                customer,
                delivery_mode:    deliveryMode,
                delivery_charge:  deliveryCharge,
                subtotal,
                grand_total:      grandTotal,
                courier_name:     courierName  || null,
                courier_days:     courierDays  || null,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.verified) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            setLoading(false);
            onSuccess(verifyData.receipt_no, response.razorpay_payment_id);

          } catch (verifyErr) {
            setLoading(false);
            const msg = verifyErr instanceof Error ? verifyErr.message : "Verification failed";
            setErrorMsg(msg);
            onFailure?.(msg);
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            // User cancelled — not an error
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      setLoading(false);
      const msg = err instanceof Error ? err.message : "Payment failed";
      setErrorMsg(msg);
      onFailure?.(msg);
    }
  };

  return (
    <>
      {/* Load Razorpay checkout.js */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setScriptLoaded(true)}
        strategy="lazyOnload"
      />

      <div className="space-y-3">
        {/* Pay button */}
        <button
          onClick={handlePayment}
          disabled={disabled || loading || !scriptLoaded}
          className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-2xl text-base transition-all shadow-sm ${
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-brand-primary hover:bg-brand-dark text-white"
          } disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              💳 Pay ₹{(grandTotal).toLocaleString("en-IN")} Securely
            </>
          )}
        </button>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span>🔒 Secure Payment</span>
          <span>•</span>
          <span>Powered by Razorpay</span>
          <span>•</span>
          <span>UPI / Card / NetBanking</span>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
            ❌ {errorMsg}
          </div>
        )}
      </div>
    </>
  );
}
