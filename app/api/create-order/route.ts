/**
 * POST /api/create-order
 * Creates a Razorpay order — called before showing payment modal
 * KEY_SECRET stays server-side only, never reaches frontend
 */
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = "INR", receipt, notes } = body;

    // Validate amount — minimum 100 paise (₹1)
    if (!amount || typeof amount !== "number" || amount < 100) {
      return NextResponse.json(
        { error: "Amount must be at least 100 paise (₹1)" },
        { status: 400 }
      );
    }

    // Create order via Razorpay
    const order = await razorpay.orders.create({
      amount:   Math.round(amount), // paise — must be integer
      currency: currency || "INR",
      receipt:  receipt  || `rcpt_${Date.now()}`,
      notes:    notes    || {},
    });

    return NextResponse.json({
      success:   true,
      order_id:  order.id,
      amount:    order.amount,
      currency:  order.currency,
      receipt:   order.receipt,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Order creation failed";
    console.error("Razorpay create-order error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
