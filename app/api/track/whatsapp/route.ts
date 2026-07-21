import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  await supabase.from("whatsapp_clicks").insert({
    product_id:    body.product_id || null,
    product_name:  body.product_name || null,
    product_brand: body.product_brand || null,
    product_price: body.product_price || null,
    customer_name: body.customer_name || null,
    customer_phone: body.customer_phone || null,
    source:        body.source || "product_card",
    page_url:      body.page_url || null,
  });
  return NextResponse.json({ ok: true });
}
