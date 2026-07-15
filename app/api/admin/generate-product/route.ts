import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

const PROMPT = `You are a professional Indian beauty product expert and SEO specialist for "Shree Ambika Beauty Shop".

Analyze this product image and generate complete product details optimized for SEO, GEO, AEO, and LLM ranking.

Return ONLY raw JSON — no markdown, no code blocks, no explanation, just the JSON object:
{
  "name": "Full product name with brand variant shade size",
  "brand": "Brand name exactly as on product",
  "category": "One of: Cosmetics, Makeup, Skin Care, Hair Care, Body Care, Perfumes, Electronics, Purses & Bags, Wax & Accessories",
  "price": selling_price_number_INR,
  "mrp": mrp_number_INR,
  "description": "Rich 150-200 word SEO description with benefits, ingredients, skin type, how to use, keywords: buy online original product best price India",
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

// Signed Cloudinary upload — no preset needed, no slash issues
async function uploadToCloudinarySigned(
  imageBase64: string,
  mimeType: string,
  productName?: string
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "zjlchjal";
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;

  const timestamp = Math.floor(Date.now() / 1000).toString();

  // SEO-friendly public_id from product name
  const seoSlug = productName
    ? productName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50)
    : `product-${timestamp}`;

  const publicId = `shreeambika-products/${seoSlug}`;

  // Sign: alphabetical params + secret
  const signStr = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(signStr).digest("hex");

  const dataUrl = `data:${mimeType || "image/jpeg"};base64,${imageBase64}`;

  const params = new URLSearchParams();
  params.append("file", dataUrl);
  params.append("api_key", apiKey);
  params.append("timestamp", timestamp);
  params.append("signature", signature);
  params.append("public_id", publicId);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    }
  );

  const data = await res.json();
  if (!res.ok || data.error) {
    throw new Error(`Cloudinary upload failed: ${data.error?.message || "unknown"}`);
  }
  return data.secure_url as string;
}

// Groq vision with public URL
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

  const { imageUrl, imageBase64, mimeType } = await req.json();
  
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  let finalImageUrl = imageUrl;

  // If no URL provided, upload base64 to Cloudinary first (fallback)
  if (!finalImageUrl && imageBase64) {
    try {
      finalImageUrl = await uploadToCloudinarySigned(imageBase64, mimeType);
    } catch (err) {
      return NextResponse.json({ 
        error: `Image upload failed: ${err instanceof Error ? err.message : "unknown"}` 
      }, { status: 500 });
    }
  }

  if (!finalImageUrl) {
    return NextResponse.json({ error: "Image URL or base64 required" }, { status: 400 });
  }

  try {
    const raw = await callGroq(finalImageUrl, groqKey);
    const productData = parseJSON(raw);
    return NextResponse.json({
      success: true,
      data: { ...productData, _imageUrl: finalImageUrl },
      provider: "groq",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
