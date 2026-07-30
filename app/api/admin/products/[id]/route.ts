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

// Helper — fire-and-forget IndexNow ping (doesn't block the response)
async function pingIndexNow(slug: string) {
  try {
    await fetch(`https://www.shreeambikabeauty.com/api/indexnow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls: [
          `https://www.shreeambikabeauty.com/products/${slug}`,
          `https://www.shreeambikabeauty.com/products`,
        ],
      }),
    });
  } catch {
    // Non-critical — don't throw, just swallow
  }
}

// PATCH — partial update (e.g. price only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getAdminClient();
  const body = await req.json();
  const { data, error } = await supabase.from("products").update(body).eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Ping if slug is available (e.g. from returned data)
  if (data?.slug) pingIndexNow(data.slug);
  return NextResponse.json({ data });
}

// PUT update product
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getAdminClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("products")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Ping IndexNow so Bing/Yandex re-crawl the updated product page
  if (data?.slug) pingIndexNow(data.slug);
  return NextResponse.json({ data });
}

// DELETE product
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = getAdminClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
