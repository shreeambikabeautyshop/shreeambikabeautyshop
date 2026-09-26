/**
 * Gemini Vision helper with automatic key rotation across 30 API keys.
 * Rotates to next key on 429 (quota exceeded) errors.
 * Uses gemini-1.5-flash for fast, accurate image analysis.
 */

let _keyIdx = 0;

function getGeminiKeys(): string[] {
  const keys: string[] = [];
  // Primary keys
  for (const k of [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,
    process.env.GEMINI_API_KEY_7,
    process.env.GEMINI_API_KEY_8,
    process.env.GEMINI_API_KEY_9,
    process.env.GEMINI_API_KEY_10,
    process.env.GEMINI_API_KEY_11,
    process.env.GEMINI_API_KEY_12,
    process.env.GEMINI_API_KEY_13,
    process.env.GEMINI_API_KEY_14,
    process.env.GEMINI_API_KEY_15,
    process.env.GEMINI_API_KEY_16,
    process.env.GEMINI_API_KEY_17,
    process.env.GEMINI_API_KEY_18,
    process.env.GEMINI_API_KEY_19,
    process.env.GEMINI_API_KEY_20,
    process.env.GEMINI_API_KEY_21,
    process.env.GEMINI_API_KEY_22,
    process.env.GEMINI_API_KEY_23,
    process.env.GEMINI_API_KEY_24,
    process.env.GEMINI_API_KEY_25,
    process.env.GEMINI_API_KEY_26,
    process.env.GEMINI_API_KEY_27,
    process.env.GEMINI_API_KEY_28,
    process.env.GEMINI_API_KEY_29,
  ]) {
    if (k) keys.push(k);
  }
  return keys;
}

/**
 * Analyze an image via URL using Gemini Vision.
 * Fetches the image server-side and sends as base64 inline_data.
 */
export async function geminiVisionUrl(
  imageUrl: string,
  prompt: string,
  maxTokens = 2048,
  temperature = 0.4,
): Promise<string> {
  const keys = getGeminiKeys();
  if (keys.length === 0) throw new Error("No Gemini API key configured");

  // Fetch image and convert to base64
  const imgRes    = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) });
  if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
  const imgBuffer = await imgRes.arrayBuffer();
  const imgBase64 = Buffer.from(imgBuffer).toString("base64");
  const imgMime   = imgRes.headers.get("content-type") || "image/jpeg";

  return geminiVisionBase64(imgBase64, imgMime, prompt, maxTokens, temperature);
}

/**
 * Analyze a base64-encoded image using Gemini Vision.
 */
export async function geminiVisionBase64(
  imageBase64: string,
  mimeType: string,
  prompt: string,
  maxTokens = 2048,
  temperature = 0.4,
): Promise<string> {
  const keys = getGeminiKeys();
  if (keys.length === 0) throw new Error("No Gemini API key configured");

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const key = keys[(_keyIdx + attempt) % keys.length];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: imageBase64 } },
            ],
          }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
        signal: AbortSignal.timeout(30000),
      }
    );

    const data = await res.json();

    // Rate limit / quota — rotate to next key
    if (res.status === 429 || data?.error?.code === 429 || data?.error?.status === "RESOURCE_EXHAUSTED") {
      _keyIdx = (_keyIdx + attempt + 1) % keys.length;
      continue;
    }

    if (!res.ok) {
      const errMsg = data?.error?.message || `Gemini error ${res.status}`;
      // If invalid key, skip to next
      if (res.status === 400 || res.status === 403) {
        _keyIdx = (_keyIdx + attempt + 1) % keys.length;
        continue;
      }
      throw new Error(errMsg);
    }

    // Advance key index for next call (round-robin)
    _keyIdx = (_keyIdx + attempt + 1) % keys.length;

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!text) throw new Error("Gemini returned empty response");
    return text;
  }

  throw new Error("All 30 Gemini API keys exhausted. Try again later.");
}

/**
 * Text-only Gemini call (no image)
 */
export async function geminiText(
  prompt: string,
  maxTokens = 512,
  temperature = 0.7,
): Promise<string> {
  const keys = getGeminiKeys();
  if (keys.length === 0) throw new Error("No Gemini API key configured");

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const key = keys[(_keyIdx + attempt) % keys.length];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    const data = await res.json();

    if (res.status === 429 || data?.error?.status === "RESOURCE_EXHAUSTED") {
      _keyIdx = (_keyIdx + attempt + 1) % keys.length;
      continue;
    }

    if (!res.ok) {
      if (res.status === 400 || res.status === 403) {
        _keyIdx = (_keyIdx + attempt + 1) % keys.length;
        continue;
      }
      throw new Error(data?.error?.message || `Gemini error ${res.status}`);
    }

    _keyIdx = (_keyIdx + attempt + 1) % keys.length;
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  throw new Error("All Gemini API keys exhausted.");
}
