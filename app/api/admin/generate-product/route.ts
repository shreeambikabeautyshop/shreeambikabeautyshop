import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

const PROMPT = `You are a professional Indian beauty product expert and SEO specialist for "Shree Ambika Beauty Shop".

Analyze this product image and generate complete product details optimized for SEO, GEO, AEO, and LLM ranking.

Return ONLY raw JSON — no markdown, no code blocks, no explanation:
{
  "name": "Full product name with brand variant shade size",
  "brand": "Brand name exactly as on product",
  "category": "One of: Cosmetics, Makeup, Skin Care, Hair Care, Body Care, Perfumes, Electronics, Purses & Bags, Wax & Accessories",
  "price": selling_price_number_INR,
  "mrp": mrp_number_INR,
  "description": "Rich 150-200 word SEO description with benefits ingredients skin type how to use keywords: buy online original product best price India",
  "tags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8"],
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

// Upload base64 to Cloudinary, get public URL
async function getPublicImageUrl(imageBase64: string, mimeType: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "zjlchjal";
  const ext = mimeType?.includes("png") ? "png" : "jpg";

  // Build multipart body manually (Node.js compatible)
  const boundary = `----FormBoundary${Date.now()}`;
  const imageBuffer = Buffer.from(imageBase64, "base64");
  const nl = "\r\n";

  const before = [
    `--${boundary}${nl}`,
    `Content-Disposition: form-data; name="upload_preset"${nl}${nl}`,
    `shreeambika_products${nl}`,
    `--${boundary}${nl}`,
    `Content-Disposition: form-data; name="folder"${nl}${nl}`,
    `temp-ai-analysis${nl}`,
    `--${boundary}${nl}`,
    `Content-Disposition: form-data; name="file"; filename="product.${ext}"${nl}`,
    `Content-Type: ${mimeType || "image/jpeg"}${nl}${nl}`,
  ].join("");

  const after = `${nl}--${boundary}--${nl}`;

  const body = Buffer.concat([
    Buffer.from(before),
    imageBuffer,
    Buffer.from(after),
  ]);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
      body,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Image upload failed: ${err.error?.message || "unknown"}`);
  }
  const data = await res.json();
  return data.secure_url as string;
}

// Groq with public URL (only method that works reliably)
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

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageBase64, mimeType } = await req.json();
  if (!imageBase64) {
    return NextResponse.json({ error: "Image required" }, { status: 400 });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  try {
    // Step 1: Upload image to Cloudinary to get public URL
    const imageUrl = await getPublicImageUrl(imageBase64, mimeType);

    // Step 2: Send URL to Groq for analysis
    const raw = await callGroq(imageUrl, groqKey);
    const data = parseJSON(raw);

    return NextResponse.json({ success: true, data, provider: "groq" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
