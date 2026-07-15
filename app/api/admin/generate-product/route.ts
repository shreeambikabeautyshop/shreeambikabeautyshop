import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

const PROMPT = `You are a professional Indian beauty product expert and SEO specialist for "Shree Ambika Beauty Shop".

Analyze this product image and generate complete product details optimized for SEO, GEO, AEO, and LLM ranking.

Return ONLY a valid JSON object — no markdown, no explanation, just raw JSON:
{
  "name": "Full product name with brand, variant, shade/size",
  "brand": "Brand name exactly as on product",
  "category": "One of: Cosmetics, Makeup, Skin Care, Hair Care, Body Care, Perfumes, Electronics, Purses & Bags, Wax & Accessories",
  "price": selling_price_number_INR,
  "mrp": mrp_number_INR,
  "description": "Rich 150-200 word SEO description with benefits, ingredients, skin type, how to use, keywords: buy online original product best price India",
  "tags": ["tag1","tag2"],
  "seo_title": "SEO title max 60 chars",
  "seo_description": "Meta description max 155 chars",
  "key_benefits": ["benefit1","benefit2","benefit3","benefit4","benefit5"],
  "how_to_use": "Step by step usage",
  "suitable_for": "Skin/hair type suitability",
  "faq": [{"q":"question","a":"answer"},{"q":"question","a":"answer"},{"q":"question","a":"answer"}]
}`;

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

async function uploadToCloudinaryTemp(imageBase64: string, mimeType: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "zjlchjal";

  // Use fetch with multipart form - Node.js compatible way
  const boundary = "----FormBoundary" + Math.random().toString(36).slice(2);
  const imageBuffer = Buffer.from(imageBase64, "base64");

  const bodyParts: Buffer[] = [];
  const addField = (name: string, value: string) => {
    bodyParts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`));
  };
  addField("upload_preset", "shreeambika_products");
  addField("folder", "temp-ai-analysis");

  bodyParts.push(Buffer.from(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="product.jpg"\r\nContent-Type: ${mimeType || "image/jpeg"}\r\n\r\n`
  ));
  bodyParts.push(imageBuffer);
  bodyParts.push(Buffer.from(`\r\n--${boundary}--\r\n`));

  const bodyBuffer = Buffer.concat(bodyParts);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body: bodyBuffer,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Cloudinary upload failed: ${err.error?.message || "unknown"}`);
  }
  const data = await res.json();
  return data.secure_url as string;
}

async function callGroq(imageUrl: string, apiKey: string): Promise<string> {
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
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: PROMPT },
        ],
      }],
      temperature: 0.4,
      max_tokens: 2048,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || "Groq error");
  return data.choices?.[0]?.message?.content || "";
}

function parseJSON(raw: string) {
  // Remove markdown code blocks if present
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
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
  let lastError = "";

  // 1. Try Gemini first (supports base64 directly)
  if (geminiKey) {
    try {
      const raw = await callGemini(imageBase64, mimeType, geminiKey);
      const data = parseJSON(raw);
      return NextResponse.json({ success: true, data, provider: "gemini" });
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Gemini failed";
      if (lastError !== "QUOTA_EXCEEDED") {
        // Non-quota error — still try Groq
      }
    }
  }

  // 2. Fallback to Groq (needs public URL)
  if (groqKey) {
    try {
      // Upload image to Cloudinary first to get public URL
      const imageUrl = await uploadToCloudinaryTemp(imageBase64, mimeType);
      const raw = await callGroq(imageUrl, groqKey);
      const data = parseJSON(raw);
      return NextResponse.json({ success: true, data, provider: "groq" });
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Groq failed";
    }
  }

  return NextResponse.json({
    error: lastError.includes("QUOTA_EXCEEDED")
      ? "⏳ AI quota exceeded. Please try again in 1 minute."
      : `AI generation failed: ${lastError}`
  }, { status: 500 });
}
