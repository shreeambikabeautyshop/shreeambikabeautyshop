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
  const productUrl = product.shortUrl || `${SHOP_URL}/products/${product.slug}`;
  // Shorten product name to max 35 chars for character budget
  const shortName = product.name.length > 35 ? product.name.slice(0, 33) + "…" : product.name;
  const shortBrand = product.brand.length > 15 ? product.brand.slice(0, 14) + "…" : product.brand;
  const shortCat = product.category.length > 12 ? product.category.slice(0, 11) + "…" : product.category;

  // Fixed template — count chars carefully
  // Template (without hook) = ~230 chars, so hook must be 40-50 chars
  const template = `[HOOK]
✨ ${shortName}
🏷️ ${shortBrand} | ${shortCat}
🛒 ${productUrl}
🌐 shreeambikabeauty.com
📞 +91 82914 55297
📍 Dahisar, Mumbai 400068
#${product.brand.replace(/\s+/g, "")} #MumbaiBeauty #Beauty`;

  const templateWithoutHook = template.replace("[HOOK]\n", "");
  const remainingChars = 275 - templateWithoutHook.length;

  return `Write ONE catchy hook sentence for this beauty product caption.
Product: ${product.name} by ${product.brand} (${product.category})
The hook must be EXACTLY between ${Math.max(remainingChars - 5, 30)} and ${remainingChars} characters (including spaces and emojis).
Make it emotional, engaging, with 1-2 emojis. Mumbai audience. No hashtags.
Return ONLY the hook sentence, nothing else.`;
}

// Build the final caption by injecting AI hook into template
function buildCaption(product: {
  name: string; brand: string; category: string; slug: string; shortUrl?: string;
}, hook: string): string {
  const productUrl = product.shortUrl || `${SHOP_URL}/products/${product.slug}`;
  const shortName  = product.name.length > 35 ? product.name.slice(0, 33) + "…" : product.name;
  const shortBrand = product.brand.length > 15 ? product.brand.slice(0, 14) + "…" : product.brand;
  const shortCat   = product.category.length > 12 ? product.category.slice(0, 11) + "…" : product.category;
  const tag1 = product.brand.replace(/\s+/g, "");
  const tag2 = product.category.replace(/\s+/g, "");

  return `${hook.trim()}
✨ ${shortName}
🏷️ ${shortBrand} | ${shortCat}
🛒 ${productUrl}
🌐 shreeambikabeauty.com
📞 +91 82914 55297
📍 Dahisar, Mumbai 400068
#${tag1} #MumbaiBeauty #${tag2}`;
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

  const product    = { name, brand, category, price, slug, shortUrl };
  const prompt     = buildPrompt(product);
  const geminiKeys = getGeminiKeys();
  const groqKeys   = getGroqKeys();

  let hook = "";
  let provider = "";
  let lastError = "";

  // Try Gemini keys first (rotate on 429)
  for (const key of geminiKeys) {
    try {
      hook     = await callGemini(key, prompt);
      provider = "gemini";
      break;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Unknown";
      if (lastError !== "RATE_LIMIT") break;
      continue;
    }
  }

  // Fallback to Groq
  if (!hook) {
    for (const key of groqKeys) {
      try {
        hook     = await callGroq(key, prompt);
        provider = "groq";
        break;
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Unknown";
        if (lastError !== "RATE_LIMIT") break;
        continue;
      }
    }
  }

  if (!hook) {
    return NextResponse.json(
      { error: `Caption generation failed: ${lastError}` },
      { status: 500 }
    );
  }

  // Build full caption with hook injected into hardcoded template
  const caption = adjustCaption(buildCaption(product, hook));

  return NextResponse.json({
    caption,
    chars: caption.length,
    provider,
  });
}
