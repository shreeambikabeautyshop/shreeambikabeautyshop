/**
 * GET /api/my-orders?phone=8291455297
 * Returns orders for a customer by phone number (server-side, service role key)
 * This bypasses RLS and works for all customers
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawPhone = searchParams.get("phone") || "";

  if (!rawPhone || rawPhone.length < 10) {
    return NextResponse.json({ error: "Phone required" }, { status: 400 });
  }

  // Normalize — keep last 10 digits
  const phone10 = rawPhone.replace(/\D/g, "").slice(-10);

  if (phone10.length !== 10) {
    return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  }

  const supabase = getAdmin();

  // Try all phone formats stored in DB
  const { data, error } = await supabase
    .from("sabs_orders")
    .select("id,sabs_order_id,receipt_no,razorpay_payment_id,product_name,product_price,grand_total,subtotal,delivery_charge,items,status,source,delivery_address,delivery_city,delivery_pincode,awb,awb_code,tracking_url,courier_name,estimated_delivery,created_at,payment_method")
    .or(`customer_phone.eq.${phone10},customer_phone.eq.+91${phone10},customer_phone.eq.91${phone10}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[my-orders API]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}
