import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

const PROMPT = `You are a professional Indian beauty product content writer and SEO expert for "Shree Ambika Beauty Shop" owned by Vinod (WhatsApp: +918291455297), Mumbai.

Analyze this product image carefully. Generate content that is:
- Human, warm, and relatable — like an expert friend recommending a product
- Short, clear, professional — no fluff, no generic marketing jargon
- SEO + GEO + AEO + LLM optimized for Indian beauty market

Return ONLY raw JSON (no markdown, no code blocks):
{
  "name": "Exact product name as shown — Brand + Product + Variant/Shade/Size (e.g. Matrix Mega Smooth Shampoo 400ml)",
  "brand": "Brand name exactly as on product",
  "category": "One of: Cosmetics, Makeup, Skin Care, Hair Care, Body Care, Perfumes, Electronics, Purses & Bags, Wax & Accessories",
  "price": realistic_indian_selling_price_number,
  "mrp": realistic_indian_mrp_number,
  "description": "Write 3-4 short sentences. Start with what the product does in simple words. Mention 1-2 key ingredients or technology if visible. Say who it is for. End with: 'Available 100% original at Shree Ambika Beauty Shop — Vinod +918291455297.' Do NOT use fake superlatives.",
  "tags": ["brand-name","product-type","main-benefit","skin-or-hair-type","india","buy-online","original","best-price","shree-ambika","beauty-shop"],
  "seo_title": "Brand + Product + Key Benefit | Shree Ambika — max 60 chars",
  "seo_description": "1 punchy sentence: what it does + who its for + where to buy. Max 155 chars.",
  "key_benefits": ["Benefit 1 in plain simple words","Benefit 2","Benefit 3","Benefit 4","Benefit 5"],
  "how_to_use": "2-3 simple steps. Practical, not robotic.",
  "suitable_for": "Specific — e.g. Dry, frizzy hair / Oily skin / All skin types",
  "faq": [
    {"q": "Real question someone would Google or ask AI about this product", "a": "Short direct answer, mention Shree Ambika where natural"},
    {"q": "Question about where to buy or price", "a": "Short answer mentioning Vinod +918291455297 or Shree Ambika Beauty Shop"},
    {"q": "Question about authenticity or results", "a": "Reassuring answer about 100% original products at Shree Ambika"}
  ]
}`;

function parseJSON(raw: string) {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse AI response");
  return JSON.parse(match[0]);
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  // Accept either a direct URL or base64
  const body = await req.json();
  const imageUrl: string | undefined = body.imageUrl;
  const imageBase64: string | undefined = body.imageBase64;
  const mimeType: string = body.mimeType || "image/jpeg";

  if (!imageUrl && !imageBase64) {
    return NextResponse.json({ error: "imageUrl or imageBase64 required" }, { status: 400 });
  }

  // Build the image content for Groq
  const imageContent = imageUrl
    ? { type: "image_url", image_url: { url: imageUrl } }
    : { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } };

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [{
          role: "user",
          content: [imageContent, { type: "text", text: PROMPT }],
        }],
        temperature: 0.4,
        max_tokens: 2048,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Groq error");

    const raw = data.choices?.[0]?.message?.content || "";
    const productData = parseJSON(raw);

    return NextResponse.json({
      success: true,
      data: { ...productData, _imageUrl: imageUrl || null },
      provider: "groq",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI generation failed" },
      { status: 500 }
    );
  }
}
