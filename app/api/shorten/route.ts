import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

function generateCode(len = 6): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < len; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { product_id, product_slug, product_name } = await req.json();
    if (!product_slug) {
      return NextResponse.json({ error: "product_slug required" }, { status: 400 });
    }

    const supabase = getAdmin();
    const originalUrl = `https://www.shreeambikabeauty.com/products/${product_slug}`;

    // Check if short link already exists for this product
    const { data: existing } = await supabase
      .from("short_links")
      .select("code")
      .eq("product_slug", product_slug)
      .maybeSingle();

    if (existing?.code) {
      return NextResponse.json({
        short_url: `https://www.shreeambikabeauty.com/s/${existing.code}`,
        code: existing.code,
      });
    }

    // Generate unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 5) {
      const { data: clash } = await supabase
        .from("short_links")
        .select("code")
        .eq("code", code)
        .maybeSingle();
      if (!clash) break;
      code = generateCode();
      attempts++;
    }

    const { error } = await supabase.from("short_links").insert({
      code,
      original_url: originalUrl,
      product_id:   product_id || null,
      product_slug,
      product_name: product_name || null,
      clicks:       0,
    });

    if (error) {
      console.error("[shorten] insert error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      short_url: `https://www.shreeambikabeauty.com/s/${code}`,
      code,
    });
  } catch (err) {
    console.error("[shorten] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
