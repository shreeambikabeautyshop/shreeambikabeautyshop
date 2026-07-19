import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// GET — list all reviews (admin sees all including inactive)
export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("customer_reviews")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST — add new review
export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("customer_reviews")
    .insert({
      reviewer_name: body.reviewer_name,
      location: body.location || null,
      review_text: body.review_text || null,
      images: body.images || [],
      cloudinary_ids: body.cloudinary_ids || [],
      order_type: body.order_type || null,
      is_active: body.is_active ?? true,
      sort_order: body.sort_order ?? 0,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// PATCH — update review (toggle active, update sort_order)
export async function PATCH(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const supabase = getAdmin();
  const { data, error } = await supabase
    .from("customer_reviews")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// DELETE — remove review
export async function DELETE(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const supabase = getAdmin();
  const { error } = await supabase.from("customer_reviews").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
