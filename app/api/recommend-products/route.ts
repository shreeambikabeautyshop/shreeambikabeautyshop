import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { geminiText } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const { concern } = await req.json();
  if (!concern) return NextResponse.json({ error: "Concern required" }, { status: 400 });

  // Step 1: Use Gemini to extract search keywords from concern
  let keywords: string[] = [];
  try {
    const prompt = `A customer says their beauty concern is: "${concern}"

Extract 3-5 relevant search keywords to find matching beauty products.
Return ONLY a JSON array of keywords, nothing else.
Example: ["hair fall", "hair growth", "scalp", "serum", "shampoo"]

Concern: "${concern}"
Keywords:`;

    const raw = await geminiText(prompt, 100, 0.3);
    const match = raw.match(/\[[\s\S]*\]/);
    keywords = match ? JSON.parse(match[0]) : ["beauty", "care"];
  } catch {
    keywords = concern.toLowerCase().split(/\s+/).slice(0, 3);
  }

  // Step 2: Search Supabase products matching keywords
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const searchTerms = keywords.slice(0, 3);

  const orConditions = searchTerms
    .map(term => `name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%,tags.cs.{${term}}`)
    .join(",");

  const { data: products } = await supabase
    .from("products")
    .select("id,name,slug,brand,category,price,mrp,discount,images,rating,in_stock,description")
    .eq("in_stock", true)
    .or(orConditions)
    .limit(50);

  // Step 3: Score and sort by relevance
  const scored = (products || []).map(p => {
    let score = 0;
    const text = `${p.name} ${p.description} ${p.category}`.toLowerCase();
    keywords.forEach(kw => { if (text.includes(kw.toLowerCase())) score++; });
    return { ...p, score };
  }).sort((a, b) => b.score - a.score);

  return NextResponse.json({ products: scored, keywords, found: scored.length > 0 });
}
