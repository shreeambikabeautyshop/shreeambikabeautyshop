import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

// Collect all configured Gemini keys (uncomment more in .env.local to enable)
function getGeminiKeys(): string[] {
  return [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean) as string[];
}

// Fallback Groq keys
function getGroqKeys(): string[] {
  return [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY,
  ].filter(Boolean) as string[];
}

const SHOP_URL      = "https://www.shreeambikabeauty.com";
const WHATSAPP      = "+91 82914 55297";
const SHOP_LOCATION = "Dahisar, Mumbai, Maharashtra 400068";

function buildPrompt(product: {
  name: string; brand: string; category: string;
  price?: number; slug: string; shortUrl?: string;
}): string {
  const productUrl  = product.shortUrl || `${SHOP_URL}/products/${product.slug}`;

  return `You are a creative Indian beauty brand social media expert for "Shree Ambika Beauty Shop", Mumbai.

Write ONE stunning social media caption. Output EXACTLY this structure (no changes to labels or emojis in the fixed lines):

Line 1: 1 catchy hook sentence with 2 emojis — make it engaging & emotional about the product benefit
Line 2: blank line
Line 3: ✨ Product: ${product.name}
Line 4: 🏷️ Brand: ${product.brand} | ${product.category}
Line 5: blank line
Line 6: 1 short sentence about what makes this product special (unique benefit, why buy it)
Line 7: blank line
Line 8: 🛒 Buy Now: ${productUrl}
Line 9: 🌐 Website: ${SHOP_URL}
Line 10: 📞 Order on WhatsApp: ${WHATSAPP}
Line 11: 📍 ${SHOP_LOCATION}
Line 12: blank line
Line 13: 3 hashtags — mix of product + Mumbai + beauty ranking keywords

Rules:
- Keep Line 1 and Line 6 short and punchy
- Hashtags must be relevant to ${product.category} + Mumbai + India beauty market
- Output ONLY the caption, nothing else
- No explanations, no labels like "Caption:", just the text`;
}

async function callGemini(key: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
      }),
      signal: AbortSignal.timeout(10000),
    }
  );
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini HTTP ${res.status}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!text) throw new Error("Empty Gemini response");
  return text.trim();
}

async function callGroq(key: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 400,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (res.status === 429) throw new Error("RATE_LIMIT");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq HTTP ${res.status}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("Empty Groq response");
  return text.trim();
}

// Clean up caption formatting
function adjustCaption(caption: string): string {
  return caption.replace(/\r\n/g, "\n").replace(/ +\n/g, "\n").trim();
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, brand, category, price, slug, shortUrl } = body;

  if (!name || !slug) {
    return NextResponse.json({ error: "name and slug required" }, { status: 400 });
  }

  const prompt   = buildPrompt({ name, brand, category, price, slug, shortUrl });
  const geminiKeys = getGeminiKeys();
  const groqKeys   = getGroqKeys();

  let caption = "";
  let provider = "";
  let lastError = "";

  // Try Gemini keys first (rotate on 429)
  for (const key of geminiKeys) {
    try {
      caption  = await callGemini(key, prompt);
      provider = "gemini";
      break;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Unknown";
      if (lastError !== "RATE_LIMIT") break; // Non-rate-limit error — stop trying
      continue; // Rate limit — try next key
    }
  }

  // Fallback to Groq if Gemini failed
  if (!caption) {
    for (const key of groqKeys) {
      try {
        caption  = await callGroq(key, prompt);
        provider = "groq";
        break;
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Unknown";
        if (lastError !== "RATE_LIMIT") break;
        continue;
      }
    }
  }

  if (!caption) {
    return NextResponse.json(
      { error: `Caption generation failed: ${lastError}` },
      { status: 500 }
    );
  }

  const finalCaption = adjustCaption(caption);

  return NextResponse.json({
    caption: finalCaption,
    chars: finalCaption.length,
    provider,
  });
}
