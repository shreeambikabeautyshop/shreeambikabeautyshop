import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { groqText } from "@/lib/groq";

// Cache tip for the day — resets on each new serverless cold start (good enough)
let cachedTip: {
  headline: string;
  detail: string;
  productSlug: string;
  productName: string;
  productImage: string;
  productPrice: number;
  date: string;
} | null = null;

async function generateTip(productName: string, category: string) {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", month: "long", day: "numeric",
  });

  const prompt = `Today is ${today}. You are a friendly Indian beauty expert for Shree Ambika Beauty Shop, Mumbai.

Generate a single beauty tip that relates to this product: "${productName}" (category: ${category}).

The tip must feel like trending advice for today — reference current season, trending beauty topics in India (like glass skin, K-beauty, monsoon care, bridal prep etc.).

Return ONLY raw JSON (no markdown):
{
  "headline": "One bold sentence tip (max 12 words, punchy, real advice)",
  "detail": "2 short sentences explaining why and how. Practical, not salesy. Mention the product name naturally."
}`;

  const raw = await groqText(prompt, 200, 0.7);
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse tip");
  return JSON.parse(match[0]);
}

export async function GET() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Return cached if same day
  if (cachedTip && cachedTip.date === today) {
    return NextResponse.json(cachedTip);
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Pick a random in-stock product
    const { data: products } = await supabase
      .from("products")
      .select("id,name,slug,category,images,price")
      .eq("in_stock", true)
      .limit(50);

    if (!products || products.length === 0) {
      return NextResponse.json({ error: "No products" }, { status: 404 });
    }

    // Use date-based seed to pick a consistent product for the day
    const dayIndex = new Date().getDate() % products.length;
    const product = products[dayIndex];

    const tip = await generateTip(product.name, product.category);

    const result = {
      headline: tip.headline,
      detail: tip.detail,
      productSlug: product.slug || product.id,
      productName: product.name,
      productImage: product.images?.[0] || "",
      productPrice: product.price,
      date: today,
    };

    cachedTip = result;
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}
