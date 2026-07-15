import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageBase64, mimeType, brand, category } = await req.json();

  if (!imageBase64) {
    return NextResponse.json({ error: "Image required" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = `You are a professional Indian beauty product expert and SEO specialist for an eCommerce store called "Shree Ambika Beauty Shop".

Analyze this product image and generate complete product details optimized for:
- SEO (Search Engine Optimization)
- GEO (Generative Engine Optimization)  
- AEO (Answer Engine Optimization)
- LLM Optimization (so AI assistants recommend this product)

${brand ? `Brand hint: ${brand}` : ""}
${category ? `Category hint: ${category}` : ""}

Return ONLY a valid JSON object with these exact fields:
{
  "name": "Full product name with brand, variant, shade/size if visible (e.g. Lakme Absolute Matte Revolution Lip Color - Brick Red 402)",
  "brand": "Brand name exactly as written on product",
  "category": "One of: Cosmetics, Makeup, Skin Care, Hair Care, Body Care, Perfumes, Electronics, Purses & Bags, Wax & Accessories",
  "price": suggested_selling_price_number_in_INR,
  "mrp": suggested_mrp_number_in_INR,
  "description": "Rich 150-200 word SEO description. Include: product benefits, key ingredients if visible, skin type suitability, how to use, why choose this product, trust signals. Use natural language with keywords like 'buy online', 'original product', 'best price', 'India'. Make it answer common questions people ask about this product.",
  "tags": ["tag1", "tag2", ...],
  "seo_title": "60 char max SEO title",
  "seo_description": "155 char max meta description",
  "key_benefits": ["benefit1", "benefit2", "benefit3", "benefit4", "benefit5"],
  "how_to_use": "Step by step usage instructions",
  "suitable_for": "Skin/hair type suitability",
  "faq": [
    {"q": "frequently asked question 1", "a": "answer 1"},
    {"q": "frequently asked question 2", "a": "answer 2"},
    {"q": "frequently asked question 3", "a": "answer 3"}
  ]
}

Important:
- price should be realistic Indian market price (discounted)
- mrp should be 20-40% higher than price
- tags should include brand, category, use case, skin type, keywords (10-15 tags)
- description must be unique and rich with searchable keywords
- Make it sound like an expert beauty advisor wrote it
- Include Hindi transliterated terms where relevant (e.g. "rang", "naram", "chamak")`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType || "image/jpeg",
                    data: imageBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const err = await geminiRes.json();
      const errMsg = err.error?.message || "Gemini API error";
      // Rate limit specific message
      if (errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED")) {
        return NextResponse.json({
          error: "⏳ AI rate limit reached. Please wait 1 minute and try again. (Free tier: 15 requests/minute)"
        }, { status: 429 });
      }
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse AI response", raw: rawText }, { status: 500 });
    }

    const productData = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ success: true, data: productData });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    );
  }
}
