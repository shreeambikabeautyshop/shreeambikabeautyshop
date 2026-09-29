/**
 * POST /api/verify-payment
 * Verifies Razorpay payment signature using HMAC-SHA256
 * KEY_SECRET stays server-side only
 */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      // Cart details for receipt/order tracking
      items,
      customer,
      delivery_mode,
      delivery_charge,
      subtotal,
      grand_total,
      courier_name,       // user-selected courier name
      courier_days,       // estimated delivery days selected by user
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment fields: order_id, payment_id, signature required" },
        { status: 400 }
      );
    }

    // HMAC-SHA256 verification
    // Algorithm: HMAC(order_id + "|" + payment_id, KEY_SECRET)
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const payload   = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated = crypto
      .createHmac("sha256", keySecret)
      .update(payload)
      .digest("hex");

    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(razorpay_signature, "hex");
    const genBuffer = Buffer.from(generated,           "hex");

    const isValid =
      sigBuffer.length === genBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, genBuffer);

    if (!isValid) {
      console.error("Razorpay signature mismatch", {
        order_id:   razorpay_order_id,
        payment_id: razorpay_payment_id,
      });
      return NextResponse.json(
        { error: "Payment verification failed — signature mismatch" },
        { status: 400 }
      );
    }

    // ── Payment verified ──
    // Generate receipt number
    const receiptNo = `SABS-${Date.now().toString().slice(-8)}`;

    // Log order to Supabase — save to sabs_orders (same table as admin Orders page)
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Build product name string from items array
      const productNames = (items || []).map((i: { name: string; qty: number; price: number }) =>
        `${i.name} (x${i.qty})`
      ).join(", ");
      const firstItem = (items || [])[0];

      // Calculate estimated delivery date from selected courier days
      let estimatedDelivery: string | null = null;
      if (delivery_mode === "delivery" && courier_days && courier_days > 0) {
        const edd = new Date();
        edd.setDate(edd.getDate() + Number(courier_days));
        estimatedDelivery = edd.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      }

      await supabase.from("sabs_orders").insert({
        sabs_order_id:        receiptNo,
        receipt_no:           receiptNo,
        razorpay_payment_id:  razorpay_payment_id,
        customer_id:          customer?.phone || null,
        customer_name:        customer?.full_name  || "Customer",
        customer_phone:       customer?.phone      || null,
        product_name:         productNames         || firstItem?.name || "Order",
        product_price:        grand_total          || 0,
        subtotal:             subtotal             || 0,
        delivery_charge:      delivery_charge      || 0,
        grand_total:          grand_total          || 0,
        items:                items                || [],
        payment_method:       "razorpay",
        delivery_address:     customer?.address    || null,
        delivery_pincode:     customer?.pincode    || null,
        delivery_city:        customer?.city       || null,
        delivery_state:       customer?.state      || null,
        status:               "new",
        source:               delivery_mode === "pickup" ? "store_pickup" : "online_payment",
        courier_name:         courier_name         || null,   // user's selected courier
        estimated_delivery:   estimatedDelivery,              // calculated from selected days
        shiprocket_order_id:  null,                           // will be set when admin marks Ready to Ship
        shipment_id:          null,
        created_at:           new Date().toISOString(),
      });

      // NOTE: Shiprocket order creation happens when admin clicks "Ready to Ship"
      // No auto-creation here to keep it clean and let Vinod control dispatch timing

    } catch (dbErr) {
      console.warn("Order DB save failed (non-blocking):", dbErr);
    }

    return NextResponse.json({
      success:            true,
      verified:           true,
      receipt_no:         receiptNo,
      payment_id:         razorpay_payment_id,
      order_id:           razorpay_order_id,
      courier_name:       courier_name       || null,
      courier_days:       courier_days       || null,
      estimated_delivery: (() => {
        if (delivery_mode !== "delivery" || !courier_days) return null;
        const edd = new Date();
        edd.setDate(edd.getDate() + Number(courier_days));
        return edd.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      })(),
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    console.error("Razorpay verify-payment error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
