import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — list all orders
export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getAdmin();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // optional filter

  let query = supabase
    .from("sabs_orders")
    .select("id,sabs_order_id,shiprocket_order_id,shipment_id,awb,courier_name,estimated_delivery,customer_name,customer_phone,product_name,product_price,delivery_address,delivery_pincode,delivery_city,delivery_state,status,source,manifest_url,label_url,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}

// POST — save new order (called from create-order route after Shiprocket success)
export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getAdmin();
  const body = await req.json();

  const { data, error } = await supabase
    .from("sabs_orders")
    .insert([{
      sabs_order_id:       body.sabs_order_id,
      shiprocket_order_id: body.shiprocket_order_id,
      shipment_id:         body.shipment_id,
      awb:                 body.awb || null,
      courier_name:        body.courier_name || null,
      estimated_delivery:  body.estimated_delivery || null,
      customer_name:       body.customer_name,
      customer_phone:      body.customer_phone,
      product_name:        body.product_name,
      product_price:       body.product_price,
      delivery_address:    body.delivery_address || null,
      delivery_pincode:    body.delivery_pincode || null,
      delivery_city:       body.delivery_city || null,
      delivery_state:      body.delivery_state || null,
      status:              "new",
      source:              body.source || "whatsapp",
    }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}

// PATCH — update order status or AWB
export async function PATCH(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getAdmin();
  const body = await req.json();
  const { id, ...updates } = body;

  if (!id) return NextResponse.json({ error: "Order ID required" }, { status: 400 });

  const { data, error } = await supabase
    .from("sabs_orders")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, data });
}
