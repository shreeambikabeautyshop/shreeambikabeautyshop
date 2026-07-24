import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BASE = "https://www.shreeambikabeauty.com";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: products } = await supabase
    .from("products")
    .select("id,name,slug,brand,category,price,mrp,discount,images,description,in_stock,updated_at,tags")
    .eq("in_stock", true)
    .order("updated_at", { ascending: false });

  const items = (products || []).map((p) => {
    const url      = `${BASE}/products/${p.slug || p.id}`;
    const imageUrl = p.images?.[0] || "";
    const price    = `${p.price}.00 INR`;
    const mrp      = p.mrp > p.price ? `${p.mrp}.00 INR` : price;

    // Map category to Google product category
    const googleCategory = getGoogleCategory(p.category);

    // Clean description
    const desc = (p.description || `${p.name} by ${p.brand}. 100% original ${p.category} product. Buy online from Shree Ambika Beauty Shop Mumbai.`)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .slice(0, 5000);

    const title = `${p.name} | ${p.brand} | Shree Ambika Beauty Shop Mumbai`
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .slice(0, 150);

    return `
    <item>
      <g:id>${p.id}</g:id>
      <g:title>${title}</g:title>
      <g:description>${desc}</g:description>
      <g:link>${url}</g:link>
      <g:image_link>${imageUrl}</g:image_link>
      <g:availability>in stock</g:availability>
      <g:price>${price}</g:price>
      ${p.mrp > p.price ? `<g:sale_price>${price}</g:sale_price>` : ""}
      <g:brand>${p.brand.replace(/&/g,"&amp;")}</g:brand>
      <g:condition>new</g:condition>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:product_type>${p.category}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 INR</g:price>
      </g:shipping>
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Shree Ambika Beauty Shop — Mumbai</title>
    <link>${BASE}</link>
    <description>100% Original Beauty Products — Cosmetics, Makeup, Skincare, Haircare. Mumbai Store, Pan India Delivery.</description>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function getGoogleCategory(category: string): string {
  const map: Record<string, string> = {
    "Makeup":           "Health & Beauty > Personal Care > Cosmetics > Makeup",
    "Cosmetics":        "Health & Beauty > Personal Care > Cosmetics",
    "Skin Care":        "Health & Beauty > Personal Care > Cosmetics > Skin Care",
    "Hair Care":        "Health & Beauty > Personal Care > Hair Care",
    "Body Care":        "Health & Beauty > Personal Care > Body Care",
    "Perfumes":         "Health & Beauty > Personal Care > Cosmetics > Perfume & Cologne",
    "Electronics":      "Health & Beauty > Personal Care > Hair Care > Hair Dryers & Straighteners",
    "Purses & Bags":    "Apparel & Accessories > Handbags, Wallets & Cases > Handbags",
    "Wax & Accessories":"Health & Beauty > Personal Care > Hair Removal",
  };
  return map[category] || "Health & Beauty > Personal Care > Cosmetics";
}
