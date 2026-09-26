import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase.from("site_settings").select("key,value");

  // Fallback defaults if DB fails
  if (error) {
    return NextResponse.json(
      {
        show_price:        true,
        site_mode:         "full",
        store_open:        true,
        show_whatsapp:     true,
        show_call_button:  true,
        cod_available:     true,
        same_day_delivery: true,
        show_reviews:      true,
        announcement_text: "",
        data: {},
      },
      { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
    );
  }

  const s: Record<string, string> = {};
  (data || []).forEach((row) => { s[row.key] = row.value; });

  const response = {
    // Price
    show_price:        s.show_price        !== "false",
    // Store status
    site_mode:         s.site_mode         || "full",
    store_open:        s.store_open        !== "false",
    // Contact
    show_whatsapp:     s.show_whatsapp     !== "false",
    show_call_button:  s.show_call_button  !== "false",
    // Delivery
    cod_available:     s.cod_available     !== "false",
    same_day_delivery: s.same_day_delivery !== "false",
    // Social proof
    show_reviews:      s.show_reviews      !== "false",
    // Announcement
    announcement_text: s.announcement_text || "",
    // Raw data for components like HeroSlider
    data: s,
  };

  return NextResponse.json(
    response,
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
