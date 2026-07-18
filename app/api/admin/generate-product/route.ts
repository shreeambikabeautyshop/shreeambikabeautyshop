import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

const PROMPT = `You are a professional Indian beauty product content writer and SEO expert for "Shree Ambika Beauty Shop" owned by Vinod (WhatsApp: +918291455297), based in Mumbai — serving customers Pan India.

Analyze this product image carefully. Generate content that is:
- Human, warm, relatable — like an expert friend recommending a product
- Short, clear, professional — no fluff, no generic marketing jargon  
- Optimized for: SEO (Google), GEO (Google Maps/Local), AEO (featured snippets), LLM (AI answers)
- Primary audience: Mumbai customers. Secondary: Pan India delivery

Return ONLY raw JSON (no markdown, no code blocks):
{
  "name": "Exact product name — Brand + Product + Variant/Size (e.g. Matrix Mega Smooth Shampoo 400ml)",
  "brand": "Brand name exactly as on product",
  "category": "One of: Cosmetics, Makeup, Skin Care, Hair Care, Body Care, Perfumes, Electronics, Purses & Bags, Wax & Accessories",
  "price": realistic_indian_selling_price_number,
  "mrp": realistic_indian_mrp_number,
  "description": "3-4 short sentences. Sentence 1: What this product does in simple words. Sentence 2: Key ingredient or technology if visible. Sentence 3: Who it is for. Sentence 4: 'Available at Shree Ambika Beauty Shop, Mumbai — Same Day Delivery in Mumbai, Pan India 4-7 days, Worldwide shipping available. WhatsApp Vinod: +918291455297.' Keep it human, not robotic.",
  "tags": ["brand-name","product-type","main-benefit","skin-or-hair-type","mumbai","india","buy-online","original","best-price","shree-ambika-beauty-shop","vinod-mumbai","pan-india-delivery"],
  "seo_title": "Brand + Product + Key Benefit | Buy in Mumbai — max 60 chars",
  "seo_description": "What it does + Mumbai/India delivery + WhatsApp to order. Max 155 chars. Include +918291455297.",
  "key_benefits": ["Clear plain-language benefit 1","Benefit 2","Benefit 3","Benefit 4","Benefit 5"],
  "how_to_use": "2-3 simple practical steps. Friendly tone.",
  "suitable_for": "Specific — e.g. Dry frizzy hair / Oily skin / All skin types",
  "faq": [
    {"q": "A real question someone in Mumbai would Google about this product", "a": "Short direct answer mentioning Shree Ambika Beauty Shop Mumbai"},
    {"q": "Do you deliver [product type] Pan India?", "a": "Yes, Shree Ambika Beauty Shop delivers Pan India. Order via WhatsApp: +918291455297. Fast delivery across Maharashtra and all over India."},
    {"q": "Is [product name] available at best price in Mumbai?", "a": "Yes, get 100% original [product] at best price from Shree Ambika Beauty Shop, Mumbai. WhatsApp Vinod at +918291455297 to order now."}
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
