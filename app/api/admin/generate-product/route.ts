import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

const PROMPT = `You are a professional Indian beauty product expert and SEO specialist for "Shree Ambika Beauty Shop".

Analyze this product image and generate complete product details optimized for SEO, GEO, AEO, and LLM ranking.

Return ONLY a valid JSON object with these exact fields:
{
  "name": "Full product name with brand, variant, shade/size (e.g. Lakme Absolute Matte Revolution Lip Color - Brick Red 402)",
  "brand": "Brand name exactly as on product",
  "category": "One of: Cosmetics, Makeup, Skin Care, Hair Care, Body Care, Perfumes, Electronics, Purses & Bags, Wax & Accessories",
  "price": suggested_selling_price_in_INR_number,
  "mrp": suggested_mrp_in_INR_number,
  "description": "Rich 150-200 word SEO description with product benefits, key ingredients, skin type suitability, how to use, trust signals, keywords like buy online original product best price India",
  "tags": ["tag1","tag2","tag3"],
  "seo_title": "SEO title max 60 chars",
  "seo_description": "Meta description max 155 chars",
  "key_benefits": ["benefit1","benefit2","benefit3","benefit4","benefit5"],
  "how_to_use": "Step by step usage instructions",
  "suitable_for": "Skin/hair type suitability",
  "faq": [
    {"q": "question 1", "a": "answer 1"},
    {"q": "question 2", "a": "answer 2"},
    {"q": "question 3", "a": "answer 3"}
  ]
}

Rules:
- price = realistic Indian market discounted price
- mrp = 20-40% higher than price
- tags = 10-15 tags including brand, category, use case, skin type
- Include Hindi transliterated terms where natural`;

async function callGemini(imageBase64: string, mimeType: string, apiKey: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } },
            { text: PROMPT }
          ]
        }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 },
      }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    const msg = data.error?.message || "Gemini error";
    if (msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw new Error(msg);
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function callGroqWithImageUrl(imageBase64: string, mimeType: string, apiKey: string) {
  // Groq llama-4-scout supports vision
  const dataUrl = `data:${mimeType || "image/jpeg"};base64,${imageBase64}`;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: dataUrl } },
            { type: "text", text: PROMPT },
          ],
        },
      ],
      temperature: 0.4,
      max_tokens: 2048,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Groq error");
  return data.choices?.[0]?.message?.content || "";
}

function parseJSON(raw: string) {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse AI response");
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageBase64, mimeType } = await req.json();
  if (!imageBase64) {
    return NextResponse.json({ error: "Image required" }, { status: 400 });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;

  // Try Gemini first
  if (geminiKey) {
    try {
      const raw = await callGemini(imageBase64, mimeType, geminiKey);
      const data = parseJSON(raw);
      return NextResponse.json({ success: true, data, provider: "gemini" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      // If quota exceeded, fall through to Groq
      if (msg !== "QUOTA_EXCEEDED") {
        return NextResponse.json({ error: msg }, { status: 500 });
      }
      // else fall through to Groq fallback
    }
  }

  // Fallback to Groq
  if (groqKey) {
    try {
      const raw = await callGroqWithImageUrl(imageBase64, mimeType, groqKey);
      const data = parseJSON(raw);
      return NextResponse.json({ success: true, data, provider: "groq" });
    } catch (err) {
      return NextResponse.json({
        error: err instanceof Error ? err.message : "Groq also failed"
      }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "No AI API key configured" }, { status: 500 });
}
