import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

const PROMPT = `You are a professional Indian beauty product expert and SEO specialist for "Shree Ambika Beauty Shop".

Analyze this product image and generate complete product details optimized for SEO, GEO, AEO, and LLM ranking.

Return ONLY a valid JSON object — no markdown, no code blocks, no explanation, just raw JSON:
{
  "name": "Full product name with brand variant shade size",
  "brand": "Brand name exactly as on product",
  "category": "One of: Cosmetics, Makeup, Skin Care, Hair Care, Body Care, Perfumes, Electronics, Purses & Bags, Wax & Accessories",
  "price": selling_price_number_INR,
  "mrp": mrp_number_INR,
  "description": "Rich 150-200 word SEO description with benefits ingredients skin type how to use keywords buy online original product best price India",
  "tags": ["tag1","tag2","tag3","tag4","tag5"],
  "seo_title": "SEO title max 60 chars",
  "seo_description": "Meta description max 155 chars",
  "key_benefits": ["benefit1","benefit2","benefit3","benefit4","benefit5"],
  "how_to_use": "Step by step usage instructions",
  "suitable_for": "Skin or hair type suitability",
  "faq": [{"q":"question1","a":"answer1"},{"q":"question2","a":"answer2"},{"q":"question3","a":"answer3"}]
}`;

function parseJSON(raw: string) {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse AI response");
  return JSON.parse(match[0]);
}

// PRIMARY: Groq with base64 data URL
async function callGroq(imageBase64: string, mimeType: string, apiKey: string): Promise<string> {
  const dataUrl = `data:${mimeType || "image/jpeg"};base64,${imageBase64}`;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: dataUrl } },
          { type: "text", text: PROMPT },
        ],
      }],
      temperature: 0.4,
      max_tokens: 2048,
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || "Groq error");
  }
  return data.choices?.[0]?.message?.content || "";
}

// FALLBACK: Gemini
async function callGemini(imageBase64: string, mimeType: string, apiKey: string): Promise<string> {
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
    if (msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED") || res.status === 429) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw new Error(msg);
  }
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageBase64, mimeType } = await req.json();
  if (!imageBase64) {
    return NextResponse.json({ error: "Image required" }, { status: 400 });
  }

  const groqKey = process.env.GROQ_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  let lastError = "";

  // 1. PRIMARY: Groq (fast, high limits, vision capable)
  if (groqKey) {
    try {
      const raw = await callGroq(imageBase64, mimeType, groqKey);
      const data = parseJSON(raw);
      return NextResponse.json({ success: true, data, provider: "groq" });
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Groq failed";
    }
  }

  // 2. FALLBACK: Gemini
  if (geminiKey) {
    try {
      const raw = await callGemini(imageBase64, mimeType, geminiKey);
      const data = parseJSON(raw);
      return NextResponse.json({ success: true, data, provider: "gemini" });
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Gemini failed";
    }
  }

  return NextResponse.json({
    error: lastError.includes("QUOTA_EXCEEDED")
      ? "⏳ AI quota exceeded. Please try again in 1 minute."
      : `AI generation failed: ${lastError}`
  }, { status: 500 });
}
