import { NextRequest, NextResponse } from "next/server";
import { geminiVisionUrl, geminiVisionBase64 } from "@/lib/gemini";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

const PROMPT = `You are a professional Indian beauty product content writer and SEO expert for "Shree Ambika Beauty Shop" owned by Vinod (WhatsApp: +918291455297), based in Mumbai — serving customers Pan India.

Analyze this product image carefully. Generate content that is:
- Human, warm, relatable — like an expert friend recommending a product
- Short, clear, professional — no fluff, no generic marketing jargon
- Optimized for: SEO (Google), GEO (Google Maps/Local), AEO (featured snippets), LLM (AI answers)
- Primary audience: Mumbai customers. Secondary: Pan India delivery

Return ONLY raw JSON (no markdown, no code blocks, no explanation):
{
  "name": "Exact product name — Brand + Product + Variant/Size (e.g. Matrix Mega Smooth Shampoo 400ml)",
  "brand": "Brand name exactly as on product",
  "category": "One of: Cosmetics, Makeup, Skin Care, Hair Care, Body Care, Perfumes, Electronics, Purses & Bags, Wax & Accessories",
  "price": realistic_indian_selling_price_as_number,
  "mrp": realistic_indian_mrp_as_number,
  "weight_kg": estimated_weight_in_kg_as_decimal (e.g. 0.1 for small serum, 0.3 for shampoo, 0.5 for 400ml, 1.2 for hair dryer),
  "description": "3-4 short sentences. What it does, key ingredient, who it is for, and: Available at Shree Ambika Beauty Shop Mumbai — Same Day Delivery in Mumbai, Pan India 4-7 days. WhatsApp Vinod: +918291455297",
  "tags": ["brand","product-type","benefit","skin-type","mumbai","india","original","shree-ambika-beauty-shop"],
  "seo_title": "Brand + Product + Benefit | Buy in Mumbai — max 60 chars",
  "seo_description": "Product benefit + Mumbai delivery + WhatsApp. Max 155 chars. Include +918291455297.",
  "key_benefits": ["Benefit 1","Benefit 2","Benefit 3","Benefit 4","Benefit 5"],
  "how_to_use": "2-3 simple steps. Friendly tone.",
  "suitable_for": "e.g. Dry frizzy hair / Oily skin / All skin types",
  "faq": [
    {"q": "Question someone in Mumbai would Google about this product", "a": "Short answer mentioning Shree Ambika Beauty Shop Mumbai"},
    {"q": "Do you deliver [product type] Pan India?", "a": "Yes, Shree Ambika Beauty Shop delivers Pan India. WhatsApp: +918291455297."},
    {"q": "Is [product name] available at best price in Mumbai?", "a": "Yes, 100% original at best price. WhatsApp Vinod: +918291455297."}
  ]
}`;

function parseJSON(raw: string): Record<string, unknown> {
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI did not return valid JSON. Try again.");
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body      = await req.json();
  const imageUrl:    string | undefined = body.imageUrl;
  const imageBase64: string | undefined = body.imageBase64;
  const mimeType:    string             = body.mimeType || "image/jpeg";

  if (!imageUrl && !imageBase64) {
    return NextResponse.json(
      { error: "imageUrl or imageBase64 required" },
      { status: 400 }
    );
  }

  try {
    let raw: string;

    if (imageUrl && !imageBase64) {
      // Image from Cloudinary URL — fetch and send to Gemini
      raw = await geminiVisionUrl(imageUrl, PROMPT, 2048, 0.4);
    } else {
      // Base64 image — send directly to Gemini
      raw = await geminiVisionBase64(imageBase64!, mimeType, PROMPT, 2048, 0.4);
    }

    const productData = parseJSON(raw);

    return NextResponse.json({
      success:  true,
      data:     { ...productData, _imageUrl: imageUrl || null },
      provider: "gemini",
    });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    console.error("generate-product error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
