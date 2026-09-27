/**
 * Gemini Vision helper with automatic key rotation across 30 API keys
 * AND model fallback rotation.
 * 
 * Rotation strategy:
 * 1. Try primary model with all 30 keys
 * 2. If all fail (overload/quota), try next model
 * 3. Repeat for all fallback models
 */

let _keyIdx = 0;

// Models in priority order — all confirmed working with these API keys
const VISION_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-flash-latest",
];

const TEXT_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.7-flash",
  "gemini-flash-latest",
];

function getGeminiKeys(): string[] {
  const keys: string[] = [];
  for (const k of [
    process.env.GEMINI_API_KEY,    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,  process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,  process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY_6,  process.env.GEMINI_API_KEY_7,
    process.env.GEMINI_API_KEY_8,  process.env.GEMINI_API_KEY_9,
    process.env.GEMINI_API_KEY_10, process.env.GEMINI_API_KEY_11,
    process.env.GEMINI_API_KEY_12, process.env.GEMINI_API_KEY_13,
    process.env.GEMINI_API_KEY_14, process.env.GEMINI_API_KEY_15,
    process.env.GEMINI_API_KEY_16, process.env.GEMINI_API_KEY_17,
    process.env.GEMINI_API_KEY_18, process.env.GEMINI_API_KEY_19,
    process.env.GEMINI_API_KEY_20, process.env.GEMINI_API_KEY_21,
    process.env.GEMINI_API_KEY_22, process.env.GEMINI_API_KEY_23,
    process.env.GEMINI_API_KEY_24, process.env.GEMINI_API_KEY_25,
    process.env.GEMINI_API_KEY_26, process.env.GEMINI_API_KEY_27,
    process.env.GEMINI_API_KEY_28, process.env.GEMINI_API_KEY_29,
  ]) {
    if (k) keys.push(k);
  }
  return keys;
}

/** Extract text from Gemini response (handles thoughtSignature) */
function extractText(data: Record<string, unknown>): string {
  const candidates = (data.candidates as Array<{content?: {parts?: Array<{text?: string; thoughtSignature?: string}>}}>);
  const parts = candidates?.[0]?.content?.parts || [];
  // Prefer parts without thoughtSignature
  const textParts = parts.filter(p => p.text && !p.thoughtSignature).map(p => p.text!);
  if (textParts.length > 0) return textParts.join("");
  // Fallback: any part with text
  const any = parts.find(p => p.text);
  return any?.text || "";
}

/** Check if error is retriable (overload/quota) */
function isRetriable(res: Response, data: Record<string, unknown>): boolean {
  if (res.status === 429) return true;
  const errMsg = (data?.error as {message?: string})?.message || "";
  const errStatus = (data?.error as {status?: string})?.status || "";
  return (
    errStatus === "RESOURCE_EXHAUSTED" ||
    errStatus === "UNAVAILABLE" ||
    errMsg.includes("high demand") ||
    errMsg.includes("overloaded") ||
    errMsg.includes("quota")
  );
}

/** Check if error means this key/model combo is permanently broken */
function isPermanentError(res: Response, data: Record<string, unknown>): boolean {
  if (res.status === 400 || res.status === 403) return true;
  const errMsg = (data?.error as {message?: string})?.message || "";
  return errMsg.includes("no longer available") || errMsg.includes("not found");
}

/**
 * Vision call with URL — fetches image then sends as base64
 */
export async function geminiVisionUrl(
  imageUrl: string,
  prompt: string,
  maxTokens = 2048,
  temperature = 0.4,
): Promise<string> {
  const imgRes    = await fetch(imageUrl, { signal: AbortSignal.timeout(10000) });
  if (!imgRes.ok) throw new Error(`Failed to fetch image: ${imgRes.status}`);
  const imgBuffer = await imgRes.arrayBuffer();
  const imgBase64 = Buffer.from(imgBuffer).toString("base64");
  const imgMime   = imgRes.headers.get("content-type") || "image/jpeg";
  return geminiVisionBase64(imgBase64, imgMime, prompt, maxTokens, temperature);
}

/**
 * Vision call with base64 — tries all models × all keys
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

  const errors: string[] = [];

  // Try each model
  for (const model of VISION_MODELS) {
    // Try each key for this model
    for (let attempt = 0; attempt < keys.length; attempt++) {
      const key = keys[(_keyIdx + attempt) % keys.length];

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
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
              generationConfig: { temperature, maxOutputTokens: maxTokens },
            }),
            signal: AbortSignal.timeout(30000),
          }
        );

        const data = await res.json() as Record<string, unknown>;

        if (isPermanentError(res, data)) {
          // This model/key is broken — skip to next model entirely
          errors.push(`${model}: ${(data?.error as {message?: string})?.message}`);
          break; // break key loop, try next model
        }

        if (isRetriable(res, data)) {
          // Overloaded — try next key
          _keyIdx = (_keyIdx + attempt + 1) % keys.length;
          errors.push(`${model}[key${(_keyIdx + attempt) % keys.length}]: overloaded`);
          continue;
        }

        if (!res.ok) {
          errors.push(`${model}: HTTP ${res.status}`);
          break; // try next model
        }

        // Success!
        _keyIdx = (_keyIdx + attempt + 1) % keys.length;
        const text = extractText(data);
        if (!text) throw new Error(`${model} returned empty response`);
        return text;

      } catch (e) {
        if (e instanceof Error && e.message.includes("returned empty")) throw e;
        errors.push(`${model}: ${e instanceof Error ? e.message : "unknown"}`);
        break; // try next model on network errors
      }
    }
  }

  throw new Error(`All Gemini models failed. Last errors: ${errors.slice(-3).join(" | ")}`);
}

/**
 * Text-only call — tries all models × all keys
 */
export async function geminiText(
  prompt: string,
  maxTokens = 512,
  temperature = 0.7,
): Promise<string> {
  const keys = getGeminiKeys();
  if (keys.length === 0) throw new Error("No Gemini API key configured");

  const errors: string[] = [];

  for (const model of TEXT_MODELS) {
    for (let attempt = 0; attempt < keys.length; attempt++) {
      const key = keys[(_keyIdx + attempt) % keys.length];

      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
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

        const data = await res.json() as Record<string, unknown>;

        if (isPermanentError(res, data)) {
          errors.push(`${model}: permanent error`);
          break;
        }

        if (isRetriable(res, data)) {
          _keyIdx = (_keyIdx + attempt + 1) % keys.length;
          continue;
        }

        if (!res.ok) {
          errors.push(`${model}: HTTP ${res.status}`);
          break;
        }

        _keyIdx = (_keyIdx + attempt + 1) % keys.length;
        const text = extractText(data);
        if (!text) continue;
        return text;

      } catch {
        errors.push(`${model}: network error`);
        break;
      }
    }
  }

  throw new Error(`All Gemini text models failed: ${errors.slice(-3).join(" | ")}`);
}
