/**
 * Groq API helper with automatic key rotation.
 * Rotates between GROQ_API_KEY_1, GROQ_API_KEY_2, GROQ_API_KEY
 * when a 429 rate-limit error is hit, so rapid uploads don't fail.
 */

let _keyIdx = 0;

function getKeys(): string[] {
  return [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY,
  ].filter(Boolean) as string[];
}

export async function groqVision(
  imageBase64: string,
  mimeType: string,
  prompt: string,
  maxTokens = 2048,
  temperature = 0.4,
): Promise<string> {
  const keys = getKeys();
  if (keys.length === 0) throw new Error("No Groq API key configured");

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const key = keys[(_keyIdx + attempt) % keys.length];

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b",
        messages: [{
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
            { type: "text", text: prompt },
          ],
        }],
        temperature,
        max_tokens: maxTokens,
        reasoning_effort: "none",
      }),
    });

    const data = await res.json();

    if (res.status === 429 || data?.error?.code === "rate_limit_exceeded") {
      // Rate limited on this key — try next key
      _keyIdx = (_keyIdx + attempt + 1) % keys.length;
      continue;
    }

    if (!res.ok) throw new Error(data?.error?.message || `Groq error ${res.status}`);

    // Advance key index for next call (round-robin)
    _keyIdx = (_keyIdx + attempt + 1) % keys.length;

    const raw = data.choices?.[0]?.message?.content || "";
    // Strip <think>...</think> blocks from qwen
    return raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  }

  throw new Error("All Groq API keys are rate limited. Wait a few seconds and try again.");
}

export async function groqText(
  prompt: string,
  maxTokens = 512,
  temperature = 0.7,
): Promise<string> {
  const keys = getKeys();
  if (keys.length === 0) throw new Error("No Groq API key configured");

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const key = keys[(_keyIdx + attempt) % keys.length];

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    const data = await res.json();

    if (res.status === 429 || data?.error?.code === "rate_limit_exceeded") {
      _keyIdx = (_keyIdx + attempt + 1) % keys.length;
      continue;
    }

    if (!res.ok) throw new Error(data?.error?.message || `Groq error ${res.status}`);

    _keyIdx = (_keyIdx + attempt + 1) % keys.length;
    return data.choices?.[0]?.message?.content || "";
  }

  throw new Error("All Groq API keys are rate limited. Wait a few seconds and try again.");
}
