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
      courier_name,       // user-selected courier (optional)
      courier_days,       // estimated delivery days selected
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
        shiprocket_order_id:  `razorpay:${razorpay_payment_id}`,
        shipment_id:          razorpay_order_id,
        created_at:           new Date().toISOString(),
      });

      // ── Auto-create Shiprocket order (fire-and-forget, non-blocking) ──
      if (delivery_mode === "delivery" && customer?.pincode && items?.length > 0) {
        const baseUrl = "https://www.shreeambikabeauty.com";
        const totalWeight = (items as Array<{qty?: number}>).reduce(
          (s, i) => s + (i.qty || 1) * 0.3, 0
        );

        fetch(`${baseUrl}/api/shiprocket-internal`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": process.env.INTERNAL_API_SECRET || "sabs-internal-2026",
          },
          body: JSON.stringify({
            order_id:         receiptNo,
            order_date:       new Date().toISOString().split("T")[0],
            customer_name:    customer?.full_name || "Customer",
            customer_phone:   customer?.phone || "",
            delivery_address: customer?.address || "Address",
            delivery_city:    customer?.city    || "Mumbai",
            delivery_state:   customer?.state   || "Maharashtra",
            delivery_pincode: customer?.pincode || "400068",
            items,
            grand_total,
            delivery_charge,
            weight:       Math.max(0.1, totalWeight),
            courier_name: courier_name || null,   // pass user-selected courier
          }),
        }).then(async r => {
          const d = await r.json();
          if (d.success && d.shiprocket_order_id) {
            // Update sabs_orders with Shiprocket IDs + AWB
            const { createClient } = await import("@supabase/supabase-js");
            const sb = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL!,
              process.env.SUPABASE_SERVICE_ROLE_KEY!
            );
            await sb.from("sabs_orders")
              .update({
                shiprocket_order_id: d.shiprocket_order_id,
                shipment_id:         d.shipment_id,
                awb:                 d.awb         || null,
                courier_name:        d.courier_name || courier_name || null,
                estimated_delivery:  d.estimated_delivery || null,
                status:              "new",
              })
              .eq("sabs_order_id", receiptNo);
          } else {
            console.error("[verify-payment] Shiprocket auto-create failed:", d.error || d);
          }
        }).catch(e => console.error("[verify-payment] shiprocket-internal fetch error:", e));
      }

    } catch (dbErr) {
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
