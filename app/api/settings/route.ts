import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase.from("site_settings").select("key,value");
  if (error) return NextResponse.json({ show_price: true, show_mrp: true });
  const settings: Record<string, string> = {};
  (data || []).forEach((row) => { settings[row.key] = row.value; });
  return NextResponse.json({
    show_price: settings.show_price !== "false",
    show_mrp:   settings.show_mrp   !== "false",
    site_mode:  settings.site_mode  || "full",
  });
}
