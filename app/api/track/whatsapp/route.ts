import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use SERVICE_ROLE_KEY to bypass RLS — this is a server-side trusted route
const getAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getAdmin();

    // Validate product_id — must be a valid UUID or null (slug is not a UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const productId = body.product_id && uuidRegex.test(body.product_id)
      ? body.product_id
      : null; // Don't pass slug as UUID — foreign key will fail

    const { error } = await supabase.from("whatsapp_clicks").insert({
      product_id:     productId,
      product_name:   body.product_name || null,
      product_brand:  body.product_brand || null,
      product_price:  body.product_price || null,
      customer_name:  body.customer_name || null,
      customer_phone: body.customer_phone || null,
      source:         body.source || "product_card",
      page_url:       body.page_url || null,
    });
    if (error) {
      console.error("[whatsapp-track] insert error:", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[whatsapp-track] unexpected error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
