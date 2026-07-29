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

// GET — fetch current slides + history
export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getAdmin();

  // Current active slides
  const { data: current } = await supabase
    .from("site_settings")
    .select("*")
    .like("key", "slider_slide_%")
    .order("key");

  // History log
  const { data: history } = await supabase
    .from("slider_history")
    .select("*")
    .order("changed_at", { ascending: false })
    .limit(30);

  return NextResponse.json({ current: current || [], history: history || [] });
}

// POST — update a slide (saves old image to history first)
export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slideIndex, imageUrl, alt } = await req.json();
  if (slideIndex === undefined || !imageUrl) {
    return NextResponse.json({ error: "slideIndex and imageUrl required" }, { status: 400 });
  }

  const supabase = getAdmin();
  const key = `slider_slide_${slideIndex}`;

  // Fetch existing value to save in history
  const { data: existing } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (existing?.value) {
    // Save old image to history
    const old = JSON.parse(existing.value);
    await supabase.from("slider_history").insert([{
      slide_index: slideIndex,
      image_url:   old.image,
      alt:         old.alt || "",
      changed_at:  new Date().toISOString(),
    }]);
  }

  // Upsert new slide
  const value = JSON.stringify({ image: imageUrl, alt: alt || "" });
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// PATCH — restore a slide from history
export async function PATCH(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { historyId, slideIndex } = await req.json();
  if (!historyId || slideIndex === undefined) {
    return NextResponse.json({ error: "historyId and slideIndex required" }, { status: 400 });
  }

  const supabase = getAdmin();

  // Fetch history record
  const { data: record } = await supabase
    .from("slider_history")
    .select("*")
    .eq("id", historyId)
    .maybeSingle();

  if (!record) return NextResponse.json({ error: "History record not found" }, { status: 404 });

  const key = `slider_slide_${slideIndex}`;

  // Save current to history before restoring
  const { data: existing } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();

  if (existing?.value) {
    const old = JSON.parse(existing.value);
    await supabase.from("slider_history").insert([{
      slide_index: slideIndex,
      image_url:   old.image,
      alt:         old.alt || "",
      changed_at:  new Date().toISOString(),
    }]);
  }

  // Restore
  const value = JSON.stringify({ image: record.image_url, alt: record.alt || "" });
  await supabase
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() });

  return NextResponse.json({ success: true });
}

// DELETE — delete a history record
export async function DELETE(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { historyId } = await req.json();
  if (!historyId) return NextResponse.json({ error: "historyId required" }, { status: 400 });
  const supabase = getAdmin();
  await supabase.from("slider_history").delete().eq("id", historyId);
  return NextResponse.json({ success: true });
}
