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

const BASE = "https://www.shreeambikabeauty.com";

// Fire-and-forget: submit URLs to Google + Bing + Yandex + IndexNow hub
function submitToAllEngines(urls: string[]) {
  fetch(`${BASE}/api/admin/submit-to-search-engines`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ urls, type: "URL_UPDATED" }),
  }).catch(() => { /* non-critical */ });
}

// Fire-and-forget: create short URL for the product
function createShortUrl(productId: string, productSlug: string, productName: string) {
  fetch(`${BASE}/api/shorten`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ product_id: productId, product_slug: productSlug, product_name: productName }),
  }).catch(() => {});
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

  // ── Auto-trigger background tasks after save ──────────────────────────────
  // 1. Submit to all search engines (Google + Bing + Yandex)
  const categorySlug = (body.category as string || "")
    .toLowerCase().replace(/\s+/g, "-").replace(/&/g, "").replace(/--+/g, "-");
  submitToAllEngines([
    `${BASE}/products/${slug}`,
    `${BASE}/products`,
    ...(categorySlug ? [`${BASE}/categories/${categorySlug}`] : []),
  ]);

  // 2. Auto-create short URL for WhatsApp sharing
  createShortUrl(data.id, slug, body.name || "product");

  return NextResponse.json({ data }, { status: 201 });
}
