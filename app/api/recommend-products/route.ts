import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const { concern } = await req.json();
  if (!concern) return NextResponse.json({ error: "Concern required" }, { status: 400 });

  const groqKey = process.env.GROQ_API_KEY!;

  // Step 1: Use Groq to extract search keywords from concern
  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [{
        role: "user",
        content: `A customer says their beauty concern is: "${concern}"
        
Extract 3-5 relevant search keywords to find matching beauty products.
Return ONLY a JSON array of keywords, nothing else.
Example: ["hair fall", "hair growth", "scalp", "serum", "shampoo"]

Concern: "${concern}"
Keywords:`
      }],
      temperature: 0.3,
      max_tokens: 100,
    }),
  });

  const groqData = await groqRes.json();
  const rawKeywords = groqData.choices?.[0]?.message?.content || '["beauty", "care"]';
  
  let keywords: string[] = [];
  try {
    const match = rawKeywords.match(/\[[\s\S]*\]/);
    keywords = match ? JSON.parse(match[0]) : ["beauty", "care"];
  } catch {
    keywords = concern.toLowerCase().split(/\s+/).slice(0, 3);
  }

  // Step 2: Search Supabase products matching keywords
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Build OR query for name, description, tags, category
  const searchTerms = keywords.slice(0, 3);
  
  let query = supabase
    .from("products")
    .select("id,name,slug,brand,category,price,mrp,discount,images,rating,in_stock,description")
    .eq("in_stock", true);

  // Search in name and description using ilike
  const orConditions = searchTerms
    .map(term => `name.ilike.%${term}%,description.ilike.%${term}%,category.ilike.%${term}%,tags.cs.{${term}}`)
    .join(",");

  const { data: products } = await query.or(orConditions).limit(6);

  // Step 3: Score and sort by relevance
  const scored = (products || []).map(p => {
    let score = 0;
    const text = `${p.name} ${p.description} ${p.category}`.toLowerCase();
    keywords.forEach(kw => {
      if (text.includes(kw.toLowerCase())) score++;
    });
    return { ...p, score };
  }).sort((a, b) => b.score - a.score).slice(0, 3);

  return NextResponse.json({
    products: scored,
    keywords,
    found: scored.length > 0,
  });
}
