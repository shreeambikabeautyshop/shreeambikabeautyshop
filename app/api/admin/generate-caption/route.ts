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

const SHOP_URL = "https://www.shreeambikabeauty.com";
const WHATSAPP = "+918291455297";

function buildPrompt(product: {
  name: string; brand: string; category: string;
  price?: number; slug: string; shortUrl?: string;
}): string {
  const url = product.shortUrl || `${SHOP_URL}/products/${product.slug}`;
  return `You are an expert Indian beauty product social media copywriter for "Shree Ambika Beauty Shop" Mumbai.

Write ONE perfect social media caption for this product listing. Rules:
- TOTAL characters: between 260 and 280 (count every character including spaces, emojis, newlines)
- Language: Mix of friendly English + 1-2 Hindi words is fine
- Start with a catchy hook line with emoji
- Include product name: "${product.name}"
- Include brand: "${product.brand}"  
- Include category: "${product.category}"
- Include ranking keywords naturally (e.g. "best ${product.category} Mumbai", "original ${product.brand}", "100% original")
- Include: "Order: ${WHATSAPP}"
- End with this exact URL on last line: ${url}
- Use 3-5 relevant hashtags at end (ranking ones for beauty/Mumbai/India)
- NO price (we hide prices sometimes)
- Sound like a trusted Mumbai beauty shop owner, warm & confident
- MUST be between 260-280 characters total — count carefully before responding

Return ONLY the caption text, nothing else. No explanation, no labels, just the caption.`;
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

// Trim/pad caption to be within 260-280 characters
function adjustCaption(caption: string): string {
  // Clean up extra whitespace
  let c = caption.replace(/\r\n/g, "\n").replace(/ +\n/g, "\n").trim();
  if (c.length >= 260 && c.length <= 280) return c;

  // Too long — trim from hashtags area
  if (c.length > 280) {
    while (c.length > 280) {
      // Remove last word/hashtag
      c = c.replace(/\s+\S+$/, "").trim();
    }
  }

  // Still outside range — just return as-is (AI did its best)
  return c;
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
