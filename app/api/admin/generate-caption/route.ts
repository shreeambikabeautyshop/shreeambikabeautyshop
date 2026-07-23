import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

function getGeminiKeys(): string[] {
  return [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean) as string[];
}

function getGroqKeys(): string[] {
  return [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY,
  ].filter(Boolean) as string[];
}

// ── WHATSAPP CAPTION (260–280 chars) ──────────────────────────────────────────
function buildFixedLines(product: {
  name: string; brand: string; category: string; slug: string; shortUrl?: string;
}): string {
  const productUrl = product.shortUrl || `https://www.shreeambikabeauty.com/products/${product.slug}`;
  const shortName  = product.name.length  > 30 ? product.name.slice(0, 28)  + "…" : product.name;
  const shortBrand = product.brand.length > 13 ? product.brand.slice(0, 12) + "…" : product.brand;
  const shortCat   = product.category.length > 12 ? product.category.slice(0, 11) + "…" : product.category;
  const tag1 = "#" + product.brand.replace(/\s+/g, "").slice(0, 14);
  const tag2 = "#" + product.category.replace(/\s+/g, "").slice(0, 14);
  return [
    `✨ ${shortName}`,
    `🏷️ ${shortBrand} | ${shortCat}`,
    `🛒 ${productUrl}`,
    `🌐 shreeambikabeauty.com`,
    `📞 +91 82914 55297`,
    `📍 Dahisar, Mumbai 400068`,
    `${tag1} #MumbaiBeauty ${tag2}`,
  ].join("\n");
}

function buildWAPrompt(product: {
  name: string; brand: string; category: string; shortUrl?: string; slug: string;
}): string {
  const fixedLines = buildFixedLines(product);
  const TARGET = 270;
  const hookBudget = TARGET - fixedLines.length - 1;
  return `Write ONE catchy hook sentence for this beauty product caption.
Product: ${product.name} by ${product.brand} (${product.category})
The hook must be EXACTLY ${hookBudget} characters (count carefully, including spaces and emojis).
Make it emotional and engaging with 1-2 emojis. Mumbai beauty audience. No hashtags. No newlines.
Return ONLY the hook sentence — no explanation, no quotes, nothing else.`;
}

function assembleCaptionSafe(hook: string, fixedLines: string): string {
  let h = hook.replace(/\n/g, " ").replace(/\s+/g, " ").trim().replace(/^["'`]|["'`]$/g, "").trim();
  let caption = `${h}\n${fixedLines}`;
  if (caption.length > 280) {
    const maxHook = 280 - fixedLines.length - 1;
    h = h.slice(0, maxHook);
    const lastSpace = h.lastIndexOf(" ");
    if (lastSpace > 20) h = h.slice(0, lastSpace);
    h = h.trimEnd() + "…";
    caption = `${h}\n${fixedLines}`;
  }
  const PADS = [" ✨", " 💯", " 🌟", " 👌", " 🔥", " 💄", " 🛍️"];
  let padIdx = 0;
  while (caption.length < 260 && padIdx < PADS.length) {
    h = h + PADS[padIdx++];
    caption = `${h}\n${fixedLines}`;
  }
  return caption.trim();
}

// ── INSTAGRAM CAPTION (470–500 chars) ─────────────────────────────────────────
function buildIGPrompt(product: {
  name: string; brand: string; category: string;
  price: number; mrp: number; discount: number;
  shortUrl?: string; slug: string;
}): string {
  const productUrl = product.shortUrl || `https://www.shreeambikabeauty.com/products/${product.slug}`;
  const discount   = product.discount || Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return `You are an Instagram SEO expert for Shree Ambika Beauty Shop, Mumbai.
Write an Instagram caption for this product. Follow ALL rules exactly.

Product: ${product.name}
Brand: ${product.brand}
Category: ${product.category}
Price: ₹${product.price} (MRP ₹${product.mrp}, ${discount}% OFF)
Shop URL: ${productUrl}
WhatsApp: +91 82914 55297
Location: Dahisar, Mumbai

RULES:
1. Start with a POWERFUL attention-grabbing headline (1 line, all caps or bold feel, with emoji)
2. 2-3 lines of benefit-focused product info (what it does, why buy it, what makes it special)
3. Price + discount line: "💸 Only ₹${product.price} (Save ${discount}%!) ✅ 100% Original"
4. Call to action: WhatsApp order + link
5. Location line: "📍 Dahisar, Mumbai | Pan India Delivery 🚀"
6. End with 15-20 HIGHLY RELEVANT hashtags — mix of: brand-specific, category, Mumbai local, beauty trend, product-specific keywords
7. Total caption must be between 470 and 500 characters EXACTLY (count every char including spaces, newlines, emojis)
8. Hashtags must include: #MumbaiBeauty #ShreeAmbikaBeautyShop #DahisarMumbai + brand + category tags
9. No placeholder text. Make every word count for SEO and engagement.

Return ONLY the caption text — no explanation, no quotes, nothing else.`;
}

// ── IMAGE ALT TEXT ─────────────────────────────────────────────────────────────
function buildAltPrompt(product: {
  name: string; brand: string; category: string;
  price: number; slug: string;
}): string {
  return `You are an SEO expert. Write an image alt text for this beauty product.

Product: ${product.name}
Brand: ${product.brand}
Category: ${product.category}
Price: ₹${product.price}
Shop: Shree Ambika Beauty Shop, Dahisar Mumbai

RULES:
1. Must be between 100-120 characters EXACTLY
2. Include: product name + brand + category + "buy online" or "Mumbai" + price
3. Natural readable sentence — NOT just a keyword list
4. Start with the product name
5. No quotes, no explanation — ONLY the alt text

Example format: "Swiss Beauty Compact Powder by Swiss Beauty - Buy Makeup Online Mumbai ₹399 | Shree Ambika Beauty Shop"

Return ONLY the alt text.`;
}

// ── Assemble IG caption with hard 470-500 enforcement ─────────────────────────
function assembleIGCaption(raw: string): string {
  let c = raw.replace(/^["'`]|["'`]$/g, "").trim();

  // Hard trim at 500
  if (c.length > 500) {
    // Try to cut at last hashtag boundary within 500 chars
    const trimmed = c.slice(0, 500);
    const lastHash = trimmed.lastIndexOf(" #");
    if (lastHash > 400) {
      c = trimmed.slice(0, lastHash).trim();
    } else {
      c = trimmed.trim();
    }
  }

  return c;
}

// ── AI callers ─────────────────────────────────────────────────────────────────
async function callGemini(key: string, prompt: string, maxTokens = 180): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: maxTokens },
      }),
      signal: AbortSignal.timeout(12000),
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

async function callGroq(key: string, prompt: string, maxTokens = 180): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
    signal: AbortSignal.timeout(12000),
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

async function generateWithAI(prompt: string, maxTokens: number): Promise<{ text: string; provider: string }> {
  let lastError = "";

  for (const key of getGeminiKeys()) {
    try {
      const text = await callGemini(key, prompt, maxTokens);
      return { text, provider: "gemini" };
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Unknown";
      if (lastError !== "RATE_LIMIT") break;
    }
  }

  for (const key of getGroqKeys()) {
    try {
      const text = await callGroq(key, prompt, maxTokens);
      return { text, provider: "groq" };
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Unknown";
      if (lastError !== "RATE_LIMIT") break;
    }
  }

  throw new Error(`AI failed: ${lastError}`);
}

// ── Main handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, brand, category, price, mrp, discount, slug, shortUrl, type = "whatsapp" } = body;

  if (!name || !slug)
    return NextResponse.json({ error: "name and slug required" }, { status: 400 });

  const product = { name, brand, category, price: price || 0, mrp: mrp || price || 0, discount: discount || 0, slug, shortUrl };

  // ── Image Alt Text ──────────────────────────────────────────────────────────
  if (type === "alt") {
    const prompt = buildAltPrompt(product);
    const { text, provider } = await generateWithAI(prompt, 80);
    const alt = text.replace(/^["'`]|["'`]$/g, "").trim().slice(0, 125);
    return NextResponse.json({ alt, chars: alt.length, provider });
  }

  // ── Instagram Caption (500 chars) ───────────────────────────────────────────
  if (type === "instagram") {
    const prompt = buildIGPrompt(product);
    const { text, provider } = await generateWithAI(prompt, 400);
    const caption = assembleIGCaption(text);
    return NextResponse.json({ caption, chars: caption.length, provider });
  }

  // ── WhatsApp Caption (260–280 chars) — default ──────────────────────────────
  const waPrompt   = buildWAPrompt(product);
  const fixedLines = buildFixedLines(product);
  const { text: hook, provider } = await generateWithAI(waPrompt, 120);
  const caption = assembleCaptionSafe(hook, fixedLines);
  return NextResponse.json({ caption, chars: caption.length, provider });
}
