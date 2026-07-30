import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

// GET all products
export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// Helper — fire-and-forget IndexNow ping (doesn't block the response)
async function pingIndexNow(urls: string[]) {
  try {
    await fetch(`https://www.shreeambikabeauty.com/api/indexnow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    });
  } catch {
    // Non-critical — don't throw, just swallow
  }
}

// POST create product
export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getAdminClient();
  const body = await req.json();

  // Auto-generate SEO slug
  const slug = (body.name || "product")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) + "-" + Date.now().toString(36);

  const { data, error } = await supabase
    .from("products")
    .insert([{ ...body, slug }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify search engines about the new product page
  pingIndexNow([
    `https://www.shreeambikabeauty.com/products/${slug}`,
    `https://www.shreeambikabeauty.com/products`,
  ]);

  return NextResponse.json({ data }, { status: 201 });
}
