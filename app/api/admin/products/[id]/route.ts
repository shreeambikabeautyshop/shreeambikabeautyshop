import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BASE = "https://www.shreeambikabeauty.com";

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

// Fire-and-forget: submit updated product URL to Google + Bing + Yandex + IndexNow hub
function submitToAllEngines(slug: string, category?: string) {
  const categorySlug = (category || "")
    .toLowerCase().replace(/\s+/g, "-").replace(/&/g, "").replace(/--+/g, "-");
  const urls = [
    `${BASE}/products/${slug}`,
    `${BASE}/products`,
    ...(categorySlug ? [`${BASE}/categories/${categorySlug}`] : []),
  ];
  fetch(`${BASE}/api/admin/submit-to-search-engines`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ urls, type: "URL_UPDATED" }),
  }).catch(() => { /* non-critical */ });
}

// PATCH — partial update (e.g. price only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getAdminClient();
  const body = await req.json();
  // Never send 'discount' — it is a generated column in Supabase (auto-computed from price/mrp)
  const { discount: _drop, ...safeBody } = body;
  const { data, error } = await supabase
    .from("products").update(safeBody).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data?.slug) submitToAllEngines(data.slug, data.category);
  return NextResponse.json({ data });
}

// PUT update product
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getAdminClient();
  const body = await req.json();
  // Never send 'discount' — it is a generated column in Supabase
  const { discount: _drop, ...safeBody } = body;

  const { data, error } = await supabase
    .from("products")
    .update(safeBody)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (data?.slug) submitToAllEngines(data.slug, data.category);
  return NextResponse.json({ data });
}

// DELETE product
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getAdminClient();

  // Fetch slug before deleting so we can notify Google of removal
  const { data: existing } = await supabase
    .from("products")
    .select("slug")
    .eq("id", params.id)
    .single();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Tell Google + IndexNow this URL is deleted so they drop it from index
  if (existing?.slug) {
    fetch(`${BASE}/api/admin/submit-to-search-engines`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({
        urls: [`${BASE}/products/${existing.slug}`],
        type: "URL_DELETED",
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
