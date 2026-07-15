import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

const PROMPT = `You are a professional Indian beauty product expert and SEO specialist for "Shree Ambika Beauty Shop".
Analyze this product image and return ONLY raw JSON (no markdown, no code blocks):
{
  "name": "Full product name with brand variant shade size",
  "brand": "Brand name exactly as on product",
  "category": "One of: Cosmetics, Makeup, Skin Care, Hair Care, Body Care, Perfumes, Electronics, Purses & Bags, Wax & Accessories",
  "price": selling_price_INR_number,
  "mrp": mrp_INR_number,
  "description": "Rich 150-200 word SEO description with benefits, ingredients, skin type, how to use, keywords: buy online original product best price India",
  "tags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8"],
  "seo_title": "SEO title max 60 chars",
  "seo_description": "Meta description max 155 chars",
  "key_benefits": ["benefit1","benefit2","benefit3","benefit4","benefit5"],
  "how_to_use": "Step by step usage instructions",
  "suitable_for": "Skin or hair type suitability",
  "faq": [{"q":"q1","a":"a1"},{"q":"q2","a":"a2"},{"q":"q3","a":"a3"}]
}`;

function parseJSON(raw: string) {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse AI response");
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  // Accept either a direct URL or base64
  const body = await req.json();
  const imageUrl: string | undefined = body.imageUrl;
  const imageBase64: string | undefined = body.imageBase64;
  const mimeType: string = body.mimeType || "image/jpeg";

  if (!imageUrl && !imageBase64) {
    return NextResponse.json({ error: "imageUrl or imageBase64 required" }, { status: 400 });
  }

  // Build the image content for Groq
  const imageContent = imageUrl
    ? { type: "image_url", image_url: { url: imageUrl } }
    : { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } };

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{
          role: "user",
          content: [imageContent, { type: "text", text: PROMPT }],
        }],
        temperature: 0.4,
        max_tokens: 2048,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Groq error");

    const raw = data.choices?.[0]?.message?.content || "";
    const productData = parseJSON(raw);

    return NextResponse.json({
      success: true,
      data: { ...productData, _imageUrl: imageUrl || null },
      provider: "groq",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 500 }
    );
  }
}
