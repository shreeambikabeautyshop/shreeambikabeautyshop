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

// GET — fetch all settings
export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getAdmin();
  const { data, error } = await supabase.from("site_settings").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Convert to key:value object
  const settings: Record<string, string> = {};
  (data || []).forEach((row) => { settings[row.key] = row.value; });
  return NextResponse.json({ data: settings });
}

// PATCH — update a setting
export async function PATCH(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { key, value } = body;
  if (!key || value === undefined) return NextResponse.json({ error: "key and value required" }, { status: 400 });
  const supabase = getAdmin();
  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: String(value), updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
