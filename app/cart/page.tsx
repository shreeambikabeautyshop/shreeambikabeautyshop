"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import RazorpayCheckout from "@/app/components/RazorpayCheckout";
import { useCart } from "@/app/context/CartContext";
import { useUser } from "@/app/context/UserContext";
import { useSettings } from "@/app/context/SettingsContext";
import { FiMinus, FiPlus, FiTrash2, FiTruck, FiMapPin, FiPackage, FiPrinter, FiShoppingBag, FiShoppingCart } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { MdStore, MdLocalShipping } from "react-icons/md";
import { cldImg } from "@/app/lib/cloudinary-img";

type DeliveryMode = "pickup" | "delivery" | null;
type DeliveryOption = {
  label: string;   // "Standard" | "Fast" | "Express"
  tag: string;     // "standard" | "fast" | "express"
  courier: string;
  charge: number;
  days: number;
};
type DeliveryRate = {
  available: boolean;
  charge: number;   // cheapest (legacy)
  days: number;
  courier: string;
  options?: DeliveryOption[];
  error?: string;
};

// ── Small Add to Cart button for suggested products ───────────────
type SuggestedProduct = { id: string; name: string; slug: string; brand: string; price: number; images: string[]; category: string; };

function AddToCartBtn({ product }: { product: SuggestedProduct }) {
  const { add, has } = useCart();
  const { isLoggedIn, triggerLogin } = useUser();
  const [added, setAdded] = useState(false);
  const inCart = has(product.id);

  const handleClick = () => {
    if (!isLoggedIn) { triggerLogin("cart"); return; }
    add({ id: product.id, name: product.name, slug: product.slug || product.id, brand: product.brand, price: product.price, images: product.images || [], category: product.category });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <button onClick={handleClick}
      className={`mt-2 w-full flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 rounded-xl transition-colors ${
        inCart || added
          ? "bg-brand-primary text-white"
          : "bg-brand-light text-brand-primary border border-brand-primary/30 hover:bg-brand-primary hover:text-white"
      }`}>
      <FiShoppingCart size={10} />
      {inCart || added ? "In Cart ✓" : "Add to Cart"}
    </button>
  );
}

export default function CartPage() {
  const { items, remove, updateQty, clear, subtotal, totalWeight, totalItems } = useCart();
  const { customer, isLoggedIn, triggerLogin } = useUser();
  const { show_price } = useSettings();

  const [mode,       setMode]       = useState<DeliveryMode>(null);
  const [pincode,    setPincode]    = useState(customer?.pincode || "");
  const [rate,       setRate]       = useState<DeliveryRate | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError,  setRateError]  = useState("");
  const [selectedOption, setSelectedOption] = useState<DeliveryOption | null>(null);

  // Suggested products
  const [suggested, setSuggested] = useState<SuggestedProduct[]>([]);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    // Exclude items already in cart
    const cartIds = items.map(i => i.id);
    supabase.from("products")
      .select("id,name,slug,brand,price,images,category")
      .eq("in_stock", true)
      .not("id", "in", cartIds.length > 0 ? `(${cartIds.join(",")})` : "(null)")
      .limit(8)
      .order("created_at", { ascending: false })
      .then(({ data }) => setSuggested(data || []));
  }, [items]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [receiptNo,  setReceiptNo]  = useState("");
  const [paymentId,  setPaymentId]  = useState("");
  // Capture items/amounts at payment time (before cart clear)
  const [paidItems,    setPaidItems]    = useState<typeof items>([]);
  const [paidSubtotal, setPaidSubtotal] = useState(0);
  const [paidDelivery, setPaidDelivery] = useState(0);
  const [paidTotal,    setPaidTotal]    = useState(0);
  const [paidCourier,  setPaidCourier]  = useState<string | undefined>(undefined);
  const [paidEDD,      setPaidEDD]      = useState<string | undefined>(undefined);
  const receiptRef = useRef<HTMLDivElement>(null);

  const deliveryCharge = mode === "pickup" ? 0 : (selectedOption?.charge ?? rate?.charge ?? 0);
  const grandTotal     = subtotal + deliveryCharge;
  const orderDate      = new Date().toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric"
  });

  // ── Fetch Shiprocket Rate ──────────────────────────────────────────
  const fetchRate = async () => {
    if (!pincode || pincode.length !== 6) {
      setRateError("Please enter a valid 6-digit pincode");
      return;
    }
    setRateLoading(true);
    setRateError("");
    setSelectedOption(null);
    try {
      const res  = await fetch("/api/delivery-rate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode, weight: totalWeight, cod: false, value: subtotal }),
      });
      const data = await res.json();
      if (data.success && data.available) {
        setRate({
          available: true,
          charge: data.charge,
          days:   data.days,
          courier: data.courier,
          options: data.options || [],
        });
        // Auto-select standard (first option) if only 1 option
        if ((data.options || []).length === 1) {
          setSelectedOption(data.options[0]);
        }
      } else if (data.success && !data.available) {
        setRate({ available: false, charge: 0, days: 0, courier: "", error: data.message });
      } else {
        setRateError(data.error || "Could not calculate delivery charge");
      }
    } catch {
      setRateError("Network error. Please try again.");
    }
    setRateLoading(false);
  };

  // ── Build WhatsApp order message ───────────────────────────────────
  const buildWhatsAppMsg = () => {
    const lines = [
      `🛍️ *New Order — Shree Ambika Beauty Shop*`,
      ``,
      `*Customer:* ${customer?.full_name || "Customer"}`,
      `*Phone:* ${customer?.phone || ""}`,
      mode === "delivery"
        ? `*Delivery to:* ${customer?.address || ""}, ${customer?.city || ""} — ${pincode}${selectedOption ? `\n*Courier:* ${selectedOption.label} — ${selectedOption.courier} (${selectedOption.days} days) — ₹${selectedOption.charge}` : ""}`
        : `*Mode:* Store Pickup`,
      ``,
      `*Products:*`,
      ...items.map((item, i) =>
        `${i + 1}. ${item.name} (${item.brand}) — Qty: ${item.qty} × ₹${item.price} = ₹${item.price * item.qty}`
      ),
      ``,
      `*Subtotal:* ₹${subtotal.toLocaleString("en-IN")}`,
      mode === "delivery"
        ? `*Delivery (${rate?.courier}):* ₹${deliveryCharge}`
        : `*Delivery:* FREE (Store Pickup)`,
      `*Grand Total:* ₹${grandTotal.toLocaleString("en-IN")}`,
      ``,
      `Please confirm & share payment details. 🙏`,
    ];
    return encodeURIComponent(lines.join("\n"));
  };

  // ── Print receipt ──────────────────────────────────────────────────
  const handlePrint = () => {
    const el = receiptRef.current;
    if (!el) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Receipt — Shree Ambika Beauty Shop</title>
      <style>
        body { font-family: 'Courier New', monospace; max-width: 320px; margin: 0 auto; padding: 16px; font-size: 12px; }
        h1 { font-size: 18px; text-align: center; margin: 0; }
        h2 { font-size: 13px; text-align: center; margin: 2px 0; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #000; margin: 6px 0; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; }
        .bold { font-weight: bold; }
        .small { font-size: 10px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; vertical-align: top; }
        td:last-child { text-align: right; white-space: nowrap; }
      </style></head>
      <body>${el.innerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  // ── Generate Invoice HTML ─────────────────────────────────────────
  const generateInvoiceHTML = () => {
    const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    return `<!DOCTYPE html>
<html><head><title>Invoice — ${receiptNo}</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #333; }
  .header { text-align: center; border-bottom: 2px solid #C41E3A; padding-bottom: 16px; margin-bottom: 20px; }
  .logo { font-size: 28px; font-weight: 900; color: #C41E3A; }
  .tagline { font-size: 12px; color: #666; margin-top: 4px; }
  .address { font-size: 11px; color: #888; margin-top: 8px; }
  .badge { background: #fff0f3; border: 1px solid #C41E3A; color: #C41E3A; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold; display: inline-block; margin-top: 8px; }
  .section { margin: 16px 0; }
  .section-title { font-size: 11px; font-weight: bold; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .info-row { display: flex; justify-content: space-between; font-size: 13px; margin: 4px 0; }
  .info-val { font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  th { background: #f9f0f2; color: #C41E3A; font-size: 11px; text-align: left; padding: 8px; border-bottom: 2px solid #C41E3A; }
  td { padding: 8px; font-size: 12px; border-bottom: 1px solid #f0f0f0; }
  td:last-child { text-align: right; }
  .total-row td { font-weight: bold; font-size: 14px; background: #f9f0f2; border-top: 2px solid #C41E3A; }
  .success-badge { background: #22c55e; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
  .footer { text-align: center; font-size: 10px; color: #aaa; margin-top: 24px; border-top: 1px dashed #ddd; padding-top: 16px; }
  .terms { font-size: 10px; color: #999; margin-top: 12px; text-align: left; }
</style></head>
<body>
  <div class="header">
    <div class="logo">|| ॐ || Shree Ambika Beauty Shop</div>
    <div class="tagline">Your Beauty, Our Responsibility ♡</div>
    <div class="address">Shop No. 8, Ashapura Shopping Centre, C S Complex, Road No. 2,<br>Near Shanji Hotel, Anand Nagar, Dahisar East, Mumbai – 400068<br>Vinod: +91 82914 55297 | shreeambikabeauty.com</div>
    <div class="badge">TAX INVOICE / RECEIPT</div>
  </div>

  <div class="section">
    <div class="info-row"><span>Receipt No:</span><span class="info-val">${receiptNo}</span></div>
    <div class="info-row"><span>Payment ID:</span><span class="info-val" style="font-family:monospace;font-size:11px">${paymentId}</span></div>
    <div class="info-row"><span>Date & Time:</span><span class="info-val">${date}</span></div>
    <div class="info-row"><span>Status:</span><span class="success-badge">PAID</span></div>
  </div>

  <div class="section">
    <div class="section-title">Customer Details</div>
    <div class="info-row"><span>Name:</span><span class="info-val">${customer?.full_name || "Customer"}</span></div>
    <div class="info-row"><span>Phone:</span><span class="info-val">${customer?.phone || ""}</span></div>
    ${mode === "delivery" ? `<div class="info-row"><span>Delivery:</span><span class="info-val">${customer?.address || ""}, ${pincode}</span></div>
  ${paidCourier ? `<div class="info-row"><span>Courier:</span><span class="info-val">${paidCourier}</span></div>` : ""}
  ${paidEDD ? `<div class="info-row"><span>Expected Delivery:</span><span class="info-val" style="color:#16a34a">📅 ${paidEDD}</span></div>` : ""}
  ${!paidCourier ? `<div class="info-row"><span style="font-style:italic;color:#999">Tracking details will be shared on WhatsApp after dispatch</span></div>` : ""}` : `<div class="info-row"><span>Mode:</span><span class="info-val">Store Pickup</span></div>`}
  </div>

  <div class="section">
    <div class="section-title">Products Ordered</div>
    <table>
      <thead><tr><th>#</th><th>Product</th><th>Brand</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
      <tbody>
        ${paidItems.map((item, i) => `<tr><td>${i + 1}</td><td>${item.name}</td><td>${item.brand}</td><td>${item.qty}</td><td>₹${item.price}</td><td>₹${item.price * item.qty}</td></tr>`).join("")}
        <tr class="total-row"><td colspan="4"></td><td>Subtotal:</td><td>₹${paidSubtotal.toLocaleString("en-IN")}</td></tr>
        <tr class="total-row"><td colspan="4"></td><td>Delivery:</td><td>${mode === "pickup" ? "FREE" : `₹${paidDelivery}`}</td></tr>
        <tr class="total-row"><td colspan="4"></td><td>TOTAL PAID:</td><td>₹${paidTotal.toLocaleString("en-IN")}</td></tr>
      </tbody>
    </table>
  </div>

  <div class="terms">
    <strong>Terms & Conditions:</strong><br>
    • Once order is placed, it cannot be cancelled or returned.<br>
    • Cosmetic products do not come with any manufacturing warranty.<br>
    • All products are 100% original — pesa vasool guaranteed!<br>
    • For queries: WhatsApp 8291455297
  </div>

  <div class="footer">
    Thank you for shopping with Shree Ambika Beauty Shop! ♡<br>
    www.shreeambikabeauty.com | Powered by Razorpay
  </div>
</body></html>`;
  };

  const handleDownloadInvoice = () => {
    const html = generateInvoiceHTML();
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `Invoice-${receiptNo}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintInvoice = () => {
    const html = generateInvoiceHTML();
    const win  = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  // ── Payment Success Screen ────────────────────────────────────────
  if (paymentDone) {
    return (
      <>
        <Navbar />
        <style>{`
          @keyframes confetti-fall {
            0%   { transform: translateY(-100px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
          @keyframes success-scale {
            0%   { transform: scale(0); opacity: 0; }
            60%  { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes slide-up {
            from { transform: translateY(30px); opacity: 0; }
            to   { transform: translateY(0); opacity: 1; }
          }
          .confetti-piece {
            position: fixed; width: 10px; height: 10px; top: -20px;
            animation: confetti-fall linear forwards;
            border-radius: 2px;
          }
          .success-icon { animation: success-scale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s both; }
          .slide-up-1   { animation: slide-up 0.5s ease 0.3s both; }
          .slide-up-2   { animation: slide-up 0.5s ease 0.5s both; }
          .slide-up-3   { animation: slide-up 0.5s ease 0.7s both; }
          .slide-up-4   { animation: slide-up 0.5s ease 0.9s both; }
        `}</style>

        {/* Confetti */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="confetti-piece" style={{
            left: `${Math.random() * 100}%`,
            background: ["#C41E3A","#FFD700","#22c55e","#3b82f6","#a855f7","#f97316"][i % 6],
            animationDuration: `${1.5 + Math.random() * 2}s`,
            animationDelay: `${Math.random() * 0.5}s`,
            width: `${6 + Math.random() * 10}px`,
            height: `${6 + Math.random() * 10}px`,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }} />
        ))}

        <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-8">
          <div className="text-center w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-green-100">

            {/* Logo */}
            <div className="mb-3 slide-up-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://res.cloudinary.com/zjlchjal/image/upload/v1784563982/shree-ambika-beauty-shop-logo_wdds5i.png"
                alt="Shree Ambika Beauty Shop"
                className="h-10 object-contain mx-auto"
              />
            </div>

            {/* Success icon with animation */}
            <div className="success-icon mb-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto border-4 border-green-400 shadow-lg">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M8 20L16 28L32 12" stroke="#22c55e" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
                    style={{ strokeDasharray: 40, strokeDashoffset: 0, animation: "slide-up 0.4s ease 0.6s both" }} />
                </svg>
              </div>
            </div>

            <div className="slide-up-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful!</h1>
              <p className="text-gray-500 text-sm">Thank you for shopping with Shree Ambika Beauty Shop!</p>
            </div>

            {/* Receipt details */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 my-5 text-left slide-up-2">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Receipt No:</span>
                <span className="font-bold text-gray-800">{receiptNo}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Payment ID:</span>
                <span className="font-mono text-xs text-gray-500 break-all">{paymentId}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Items:</span>
                <span className="font-bold text-gray-800">{paidItems.length} product{paidItems.length !== 1 ? "s" : ""}</span>
              </div>
              {paidCourier && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Courier:</span>
                  <span className="font-bold text-gray-800">{paidCourier}</span>
                </div>
              )}
              {paidEDD && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Expected by:</span>
                  <span className="font-bold text-green-700">📅 {paidEDD}</span>
                </div>
              )}
              {!paidCourier && paidDelivery > 0 && (
                <div className="text-xs text-gray-400 mb-2 italic">
                  Courier details will be shared on WhatsApp after dispatch
                </div>
              )}
              <div className="border-t border-green-200 pt-2 flex justify-between">
                <span className="font-bold text-gray-700">Amount Paid:</span>
                <span className="font-black text-xl text-green-700">₹{paidTotal.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-5 slide-up-2">
              Your order is confirmed. Vinod will arrange dispatch and share tracking details on WhatsApp (+91 82914 55297) within a few hours.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 slide-up-3">
              <a
                href={`https://wa.me/918291455297?text=${encodeURIComponent(
                  `Hi Vinod! Payment done\nReceipt: ${receiptNo}\nPayment ID: ${paymentId}\nAmount: Rs.${paidTotal}\nPlease confirm my order dispatch.`
                )}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-sm"
              >
                <FaWhatsapp size={16} /> Confirm on WhatsApp
              </a>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleDownloadInvoice}
                  className="flex items-center justify-center gap-1.5 border-2 border-brand-primary text-brand-primary font-bold py-2.5 rounded-xl text-xs hover:bg-brand-light transition-colors">
                  <FiPackage size={13} /> Download Invoice
                </button>
                <button onClick={handlePrintInvoice}
                  className="flex items-center justify-center gap-1.5 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-xs hover:bg-gray-50 transition-colors">
                  <FiPrinter size={13} /> Print Invoice
                </button>
              </div>

              <Link href="/products"
                className="flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                <FiShoppingBag size={14} /> Continue Shopping
              </Link>
            </div>

          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Empty cart ─────────────────────────────────────────────────────
  if (items.length === 0 && !orderPlaced && !paymentDone) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <div className="text-8xl mb-6">🛒</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
            <p className="text-gray-500 text-sm mb-8">Add some beauty products and come back!</p>
            <Link href="/products"
              className="inline-flex items-center gap-2 bg-brand-primary text-white font-bold px-8 py-3.5 rounded-full hover:bg-brand-dark transition-colors">
              <FiShoppingBag /> Browse Products
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-[900px] mx-auto px-4 py-8">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
              <p className="text-sm text-gray-400">{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
            </div>
            <Link href="/products" className="flex items-center gap-1.5 text-sm text-brand-primary font-semibold hover:underline">
              <FiShoppingBag size={14} /> Continue Shopping
            </Link>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* ── LEFT: Product List ── */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-brand-light flex-shrink-0">
                    {item.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cldImg(item.images[0], 80)} alt={item.name}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">💄</div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-brand-primary uppercase">{item.brand}</p>
                    <p className="text-sm font-semibold text-gray-800 line-clamp-2">{item.name}</p>
                    {show_price && (
                      <p className="text-sm font-black text-gray-900 mt-1">₹{item.price.toLocaleString("en-IN")}</p>
                    )}
                  </div>
                  {/* Qty + Remove */}
                  <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
                    <button onClick={() => remove(item.id)}
                      className="text-red-400 hover:text-red-600 transition-colors">
                      <FiTrash2 size={14} />
                    </button>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button onClick={() => item.qty === 1 ? remove(item.id) : updateQty(item.id, item.qty - 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                        <FiMinus size={11} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                        <FiPlus size={11} />
                      </button>
                    </div>
                    {show_price && (
                      <p className="text-xs font-bold text-gray-700">
                        = ₹{(item.price * item.qty).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ── RIGHT: Order Summary ── */}
            <div className="space-y-4">

              {/* Login prompt */}
              {!isLoggedIn && (
                <div className="bg-brand-light rounded-2xl p-4 border border-brand-accent/30">
                  <p className="font-bold text-gray-800 text-sm mb-1">📱 Enter your details to continue</p>
                  <p className="text-xs text-gray-500 mb-3">Enter your name & phone to place the order</p>
                  <button onClick={() => triggerLogin("cart")}
                    className="w-full bg-brand-primary text-white font-bold py-2.5 rounded-xl text-sm hover:bg-brand-dark transition-colors">
                    Continue to Checkout →
                  </button>
                </div>
              )}

              {/* Delivery Mode Selection */}
              {isLoggedIn && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <p className="font-bold text-gray-800 text-sm mb-3">🚚 Choose Delivery Mode</p>
                  <div className="space-y-2">

                    {/* Pickup */}
                    <button
                      onClick={() => { setMode("pickup"); setRate(null); setSelectedOption(null); }}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        mode === "pickup"
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <MdStore size={20} className={mode === "pickup" ? "text-green-600" : "text-gray-400"} />
                      <div>
                        <p className="font-bold text-sm text-gray-800">🏪 Store Pickup — FREE</p>
                        <p className="text-xs text-gray-500">Visit shop, collect yourself. No delivery charge.</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Shop No. 8, Anand Nagar, Dahisar East, Mumbai 400068
                        </p>
                      </div>
                    </button>

                    {/* Home Delivery */}
                    <button
                      onClick={() => setMode("delivery")}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                        mode === "delivery"
                          ? "border-brand-primary bg-brand-light"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <MdLocalShipping size={20} className={mode === "delivery" ? "text-brand-primary" : "text-gray-400"} />
                      <div>
                        <p className="font-bold text-sm text-gray-800">📦 Home Delivery</p>
                        <p className="text-xs text-gray-500">Delivered to your door via courier</p>
                      </div>
                    </button>
                  </div>

                  {/* Pincode input for delivery */}
                  {mode === "delivery" && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-gray-600 mb-1.5">Enter delivery pincode:</p>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={pincode}
                          onChange={(e) => { setPincode(e.target.value); setRate(null); setSelectedOption(null); }}
                          placeholder="e.g. 400068"
                          maxLength={6}
                          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-primary transition-colors"
                        />
                        <button
                          onClick={fetchRate}
                          disabled={rateLoading || pincode.length !== 6}
                          className="bg-brand-primary text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-brand-dark disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                          {rateLoading ? "..." : "Check"}
                        </button>
                      </div>
                      {rateError && <p className="text-xs text-red-500 mt-1">{rateError}</p>}
                      {rate?.available && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-bold text-gray-600">📦 Choose delivery speed:</p>
                          {(rate.options || []).map((opt) => {
                            const isSelected = selectedOption?.tag === opt.tag;
                            const icons: Record<string, string> = { standard: "🐢", fast: "🚀", express: "⚡" };
                            const colors: Record<string, string> = {
                              standard: isSelected ? "border-blue-500 bg-blue-50"   : "border-gray-200 hover:border-blue-300",
                              fast:     isSelected ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300",
                              express:  isSelected ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-orange-300",
                            };
                            const badgeColors: Record<string, string> = {
                              standard: "bg-blue-100 text-blue-700",
                              fast:     "bg-green-100 text-green-700",
                              express:  "bg-orange-100 text-orange-700",
                            };
                            return (
                              <button
                                key={opt.tag}
                                onClick={() => setSelectedOption(opt)}
                                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${colors[opt.tag] || (isSelected ? "border-brand-primary bg-brand-light" : "border-gray-200")}`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{icons[opt.tag] || "📦"}</span>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-sm text-gray-800">{opt.label}</span>
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${badgeColors[opt.tag] || "bg-gray-100 text-gray-600"}`}>
                                        {opt.days} day{opt.days !== 1 ? "s" : ""}
                                      </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[150px]">{opt.courier}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-gray-900 text-sm">₹{opt.charge}</span>
                                  {isSelected && <span className="text-green-500 text-lg">✓</span>}
                                </div>
                              </button>
                            );
                          })}
                          {!selectedOption && (
                            <p className="text-[10px] text-orange-500 font-semibold text-center">
                              ↑ Select a delivery option to continue
                            </p>
                          )}
                        </div>
                      )}
                      {rate?.available === false && (
                        <div className="mt-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                          <p className="text-xs font-bold text-red-600">❌ {rate.error}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            Try store pickup or WhatsApp us.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Price Summary */}
              {isLoggedIn && mode && (mode === "pickup" || selectedOption) && (
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">💰 Price Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-semibold">₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Delivery Charges</span>
                      <span className={`font-semibold ${mode === "pickup" ? "text-green-600" : ""}`}>
                        {mode === "pickup"
                          ? "FREE"
                          : selectedOption
                            ? `₹${selectedOption.charge}`
                            : "—"
                        }
                      </span>
                    </div>
                    {mode === "delivery" && selectedOption && (
                      <div className="text-[10px] text-gray-400 -mt-1">
                        {selectedOption.label} · {selectedOption.courier} · {selectedOption.days} day{selectedOption.days !== 1 ? "s" : ""}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 italic">
                      ✅ No GST — all taxes already included in price
                    </div>
                    <div className="border-t border-gray-100 pt-2 flex justify-between">
                      <span className="font-black text-gray-900">Grand Total</span>
                      <span className="font-black text-xl text-brand-primary">
                        ₹{grandTotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* Payment Options */}
                  {(mode === "pickup" || selectedOption) && (
                    <div className="mt-4 space-y-3">

                      {/* Option 1 — Pay Online via Razorpay */}
                      <div>
                        <p className="text-xs font-bold text-gray-600 mb-2">💳 Pay Online (Instant Confirmation):</p>
                        <RazorpayCheckout
                          items={items.map(i => ({
                            id: i.id, name: i.name, brand: i.brand,
                            price: i.price, qty: i.qty,
                          }))}
                          customer={{
                            full_name: customer?.full_name,
                            phone:     customer?.phone,
                            email:     customer?.email,
                            address:   customer?.address,
                            pincode:   pincode,
                          }}
                          subtotal={subtotal}
                          deliveryCharge={deliveryCharge}
                          deliveryMode={mode as "pickup" | "delivery"}
                          deliveryPincode={pincode}
                          courierName={selectedOption?.courier}
                          courierDays={selectedOption?.days}
                          onSuccess={(rno, pid, courierN, edd) => {
                            setReceiptNo(rno);
                            setPaymentId(pid);
                            // Capture before clear
                            setPaidItems([...items]);
                            setPaidSubtotal(subtotal);
                            setPaidDelivery(deliveryCharge);
                            setPaidTotal(grandTotal);
                            setPaidCourier(courierN || selectedOption?.courier);
                            setPaidEDD(edd || (selectedOption?.days
                              ? (() => {
                                  const d = new Date();
                                  d.setDate(d.getDate() + selectedOption.days);
                                  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
                                })()
                              : undefined));
                            setPaymentDone(true);
                            clear();
                          }}
                          onFailure={(err) => console.error("Payment failed:", err)}
                        />
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 border-t border-gray-200" />
                        <span className="text-xs text-gray-400 font-semibold">OR</span>
                        <div className="flex-1 border-t border-gray-200" />
                      </div>

                      {/* Option 2 — WhatsApp Order (COD/Manual) */}
                      <div>
                        <p className="text-xs font-bold text-gray-600 mb-2">💬 Order via WhatsApp (COD/UPI on delivery):</p>
                        <a
                          href={`https://wa.me/918291455297?text=${buildWhatsAppMsg()}`}
                          target="_blank" rel="noopener noreferrer"
                          onClick={() => setOrderPlaced(true)}
                          className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-2xl transition-all"
                          style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
                        >
                          <FaWhatsapp size={18} />
                          Place Order on WhatsApp
                        </a>
                      </div>

                    </div>
                  )}

                  {/* Print Receipt */}
                  {(mode === "pickup" || rate?.available) && (
                    <button
                      onClick={handlePrint}
                      className="mt-2 w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-2xl hover:bg-gray-50 transition-colors text-sm"
                    >
                      <FiPrinter size={14} /> Print Receipt
                    </button>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── You May Also Like — More Products ── */}
        <div className="max-w-[900px] mx-auto px-4 pb-12">
          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">You May Also Like</h2>
                <p className="text-sm text-gray-400">Add more products to your cart</p>
              </div>
              <Link href="/products"
                className="flex items-center gap-1.5 text-sm text-brand-primary font-semibold hover:underline border border-brand-primary px-4 py-2 rounded-full hover:bg-brand-light transition-colors">
                <FiShoppingBag size={13} /> Shop More
              </Link>
            </div>

            {/* Actual product cards from DB */}
            {suggested.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {suggested.slice(0, 8).map((p) => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                    {/* Image */}
                    <Link href={`/products/${p.slug || p.id}`}>
                      <div className="relative aspect-square bg-brand-light overflow-hidden">
                        {p.images?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cldImg(p.images[0], 300)} alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">💄</div>
                        )}
                        <span className="absolute bottom-2 right-2 bg-white/90 text-brand-primary text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                          {p.category}
                        </span>
                      </div>
                    </Link>
                    {/* Info */}
                    <div className="p-3">
                      <p className="text-[9px] font-bold text-brand-primary uppercase tracking-wide mb-0.5">{p.brand}</p>
                      <Link href={`/products/${p.slug || p.id}`}>
                        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug hover:text-brand-primary transition-colors">{p.name}</p>
                      </Link>
                      {show_price && (
                        <p className="text-sm font-black text-gray-900 mt-1">₹{p.price}</p>
                      )}
                      {/* Add to Cart button */}
                      <AddToCartBtn product={p} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Category quick links */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
              {[
                { emoji: "💅", name: "Nail Art", href: "/categories/nail-art" },
                { emoji: "💄", name: "Makeup", href: "/categories/makeup" },
                { emoji: "✨", name: "Skin Care", href: "/categories/skincare" },
                { emoji: "💆", name: "Hair Care", href: "/categories/haircare" },
                { emoji: "🌸", name: "Perfumes", href: "/categories/perfumes" },
              ].map(cat => (
                <Link key={cat.href} href={cat.href}
                  className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 border border-gray-100 hover:border-brand-primary hover:shadow-sm transition-all text-center">
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-xs font-semibold text-gray-700">{cat.name}</span>
                </Link>
              ))}
            </div>

            {/* CTA */}
            <div className="bg-brand-primary rounded-2xl p-5 text-center text-white">
              <p className="font-bold text-base mb-1">Need help finding more products?</p>
              <p className="text-white/80 text-xs mb-4">WhatsApp Vinod — expert recommendations for your needs</p>
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want to add more products to my order. Can you suggest?"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors">
                WhatsApp for Suggestions
              </a>
            </div>
          </div>
        </div>

        {/* ── Hidden Printable Receipt ── */}
        <div className="hidden">
          <div ref={receiptRef}>
            <h1>|| ॐ ||</h1>
            <h1>श्री अंबिका</h1>
            <h2>Beauty Shop | Rental Wedding Dress</h2>
            <p className="center small">Wholesale &amp; Retail | Free Home Delivery</p>
            <p className="center small">
              Shop No. 8, Ashapura Shopping Centre, C.S. Complex,<br />
              Road No. 2, Near Shanji Hotel, Anand Nagar,<br />
              Dahisar East, Mumbai – 400068
            </p>
            <p className="center small">
              Vinod: 8291455297 | Vikram: 8824728350
            </p>
            <div className="line" />
            <div className="row">
              <span>Receipt No:</span>
              <span>#{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="row">
              <span>Date:</span>
              <span>{orderDate}</span>
            </div>
            <div className="row">
              <span>Customer:</span>
              <span>{customer?.full_name || "—"}</span>
            </div>
            <div className="row">
              <span>Phone:</span>
              <span>{customer?.phone || "—"}</span>
            </div>
            <div className="row">
              <span>Mode:</span>
              <span>{mode === "pickup" ? "Store Pickup" : `Delivery to ${pincode}`}</span>
            </div>
            <div className="line" />
            <table>
              <thead>
                <tr>
                  <td className="bold">#</td>
                  <td className="bold">Product</td>
                  <td className="bold">Qty</td>
                  <td className="bold">Rate</td>
                  <td className="bold">Amt</td>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id}>
                    <td>{i + 1}.</td>
                    <td>{item.name}<br /><span style={{fontSize:"9px"}}>{item.brand}</span></td>
                    <td>{item.qty}</td>
                    <td>₹{item.price}</td>
                    <td>₹{item.price * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="line" />
            <div className="row">
              <span>Subtotal:</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="row">
              <span>Delivery Charges:</span>
              <span>{mode === "pickup" ? "FREE" : `₹${deliveryCharge}`}</span>
            </div>
            <div className="row bold">
              <span>GRAND TOTAL:</span>
              <span>₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="line" />
            <p className="center">Thank you for shopping with us! 🙏</p>
            <p className="center">Your Beauty, Our Responsibility ♡</p>
            <div className="line" />
            <p className="small">
              <strong>Terms &amp; Conditions:</strong><br />
              • Once order is placed, it cannot be cancelled or returned.<br />
              • Cosmetic products do not come with any manufacturing warranty.<br />
              • All products are 100% original — pesa vasool guaranteed!<br />
              • For any queries: WhatsApp 8291455297
            </p>
            <div className="line" />
            <p className="center small">www.shreeambikabeauty.com</p>
          </div>
        </div>

      </main>
      <Footer />
    </>
  );
}
