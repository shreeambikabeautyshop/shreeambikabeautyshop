import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

// Gemini keys — GEMINI_API_KEY is the primary Vercel key
function getGeminiKeys(): string[] {
  return [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
  ].filter(Boolean) as string[];
}

// Groq keys — fallback only
function getGroqKeys(): string[] {
  return [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY,
  ].filter(Boolean) as string[];
}

// ── Build the fixed lines of the caption (everything except the hook) ──────────
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

// ── Build prompt — tell AI exactly how many chars the hook must be ──────────────
function buildPrompt(product: {
  name: string; brand: string; category: string; slug: string; shortUrl?: string;
}): string {
  const fixedLines  = buildFixedLines(product);
  const TARGET      = 270; // middle of 260-280 range
  const hookBudget  = TARGET - fixedLines.length - 1; // -1 for the newline between hook and fixed

  return `Write ONE catchy hook sentence for this beauty product caption.
Product: ${product.name} by ${product.brand} (${product.category})
The hook sentence must be EXACTLY ${hookBudget} characters (count carefully, including spaces and emojis).
Make it emotional and engaging with 1-2 emojis. Mumbai beauty audience. No hashtags. No newlines.
Return ONLY the hook sentence — no explanation, no quotes, nothing else.`;
}

// ── Assemble final caption with HARD 260-280 char enforcement ──────────────────
function assembleCaptionSafe(hook: string, fixedLines: string): string {
  // Clean hook — remove newlines AI may have added
  let h = hook.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

  // Remove surrounding quotes AI sometimes adds
  h = h.replace(/^["'`]|["'`]$/g, "").trim();

  let caption = `${h}\n${fixedLines}`;

  // Hard trim: never exceed 280
  if (caption.length > 280) {
    const maxHook = 280 - fixedLines.length - 1;
    // Trim at word boundary
    h = h.slice(0, maxHook);
    const lastSpace = h.lastIndexOf(" ");
    if (lastSpace > 20) h = h.slice(0, lastSpace);
    h = h.trimEnd() + "…";
    caption = `${h}\n${fixedLines}`;
  }

  // Pad if under 260 — append emoji chars to hook
  const PADS = [" ✨", " 💯", " 🌟", " 👌", " 🔥", " 💄", " 🛍️"];
  let padIdx = 0;
  while (caption.length < 260 && padIdx < PADS.length) {
    h = h + PADS[padIdx];
    caption = `${h}\n${fixedLines}`;
    padIdx++;
  }

  return caption.trim();
}

// ── AI callers ─────────────────────────────────────────────────────────────────
async function callGemini(key: string, prompt: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 120 },
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
      max_tokens: 120,
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

// ── Main handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!isAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, brand, category, price, slug, shortUrl } = body;
  if (!name || !slug)
    return NextResponse.json({ error: "name and slug required" }, { status: 400 });

  const product    = { name, brand, category, price, slug, shortUrl };
  const prompt     = buildPrompt(product);
  const fixedLines = buildFixedLines(product);

  let hook = "";
  let provider = "";
  let lastError = "";

  // Try Gemini first (primary)
  for (const key of getGeminiKeys()) {
    try {
      hook = await callGemini(key, prompt);
      provider = "gemini";
      break;
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Unknown";
      if (lastError !== "RATE_LIMIT") break;
    }
  }

  // Fallback to Groq only if all Gemini failed
  if (!hook) {
    for (const key of getGroqKeys()) {
      try {
        hook = await callGroq(key, prompt);
        provider = "groq";
        break;
      } catch (e) {
        lastError = e instanceof Error ? e.message : "Unknown";
        if (lastError !== "RATE_LIMIT") break;
      }
    }
  }

  if (!hook)
    return NextResponse.json({ error: `Caption failed: ${lastError}` }, { status: 500 });

  // Assemble with GUARANTEED 260-280 char enforcement
  const caption = assembleCaptionSafe(hook, fixedLines);

  return NextResponse.json({ caption, chars: caption.length, provider });
}
