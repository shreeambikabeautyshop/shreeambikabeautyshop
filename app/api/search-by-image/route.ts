import { NextRequest, NextResponse } from "next/server";
import { groqVision } from "@/lib/groq";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: "No image" }, { status: 400 });

    const prompt = `You are a beauty product identifier for an Indian beauty shop.

Look at this image and identify what beauty/personal care product it shows.

Return ONLY raw JSON (no markdown, no explanation):
{
  "query": "search query to find this product (product type + brand if visible, max 5 words)",
  "category": "one of: Makeup, Skin Care, Hair Care, Cosmetics, Body Care, Perfumes",
  "confidence": "high, medium, or low"
}

Examples:
- Image of a red lipstick → {"query":"red lipstick","category":"Cosmetics","confidence":"high"}
- Image of L'Oreal shampoo → {"query":"loreal shampoo hair care","category":"Hair Care","confidence":"high"}
- Image of face serum → {"query":"face serum vitamin c","category":"Skin Care","confidence":"medium"}
- Image not a beauty product → {"query":"","category":"","confidence":"low"}`;

    const raw = await groqVision(imageBase64, mimeType, prompt, 100, 0.2);
    const match = raw.match(/\{[\s\S]*?\}/);
    if (!match) return NextResponse.json({ query: "", confidence: "low" });

    const result = JSON.parse(match[0]);
    return NextResponse.json({
      query: result.query || "",
      category: result.category || "",
      confidence: result.confidence || "low",
    });
  } catch (err) {
    console.error("[search-by-image]", err);
    return NextResponse.json({ query: "", confidence: "low" });
  }
}
