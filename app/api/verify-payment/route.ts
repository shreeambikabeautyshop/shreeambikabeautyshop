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

    // Log order to Supabase if available
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      await supabase.from("orders").insert({
        receipt_no:        receiptNo,
        razorpay_order_id,
        razorpay_payment_id,
        customer_name:     customer?.full_name  || null,
        customer_phone:    customer?.phone      || null,
        customer_address:  customer?.address    || null,
        customer_pincode:  customer?.pincode    || null,
        items:             items                || [],
        delivery_mode:     delivery_mode        || "delivery",
        delivery_charge:   delivery_charge      || 0,
        subtotal:          subtotal             || 0,
        grand_total:       grand_total          || 0,
        payment_status:    "paid",
        created_at:        new Date().toISOString(),
      });
    } catch (dbErr) {
      // DB save failure should NOT block payment confirmation
      console.warn("Order DB save failed (non-blocking):", dbErr);
    }

    return NextResponse.json({
      success:    true,
      verified:   true,
      receipt_no: receiptNo,
      payment_id: razorpay_payment_id,
      order_id:   razorpay_order_id,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Verification failed";
    console.error("Razorpay verify-payment error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
