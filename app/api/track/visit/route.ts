import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use SERVICE_ROLE_KEY to bypass RLS — server-side trusted route
const getAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = getAdmin();
  const { action, session_id, ...data } = body as {
    action: string;
    session_id: string;
    [key: string]: unknown;
  };

  if (!session_id) {
    return NextResponse.json({ ok: false, error: "Missing session_id" }, { status: 400 });
  }

  if (action === "start") {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const { error: upsertErr } = await supabase.from("visitor_analytics").upsert(
      {
        session_id,
        ip_address:    ip,
        hour_of_visit: data.hour_of_visit ?? null,
        day_of_week:   data.day_of_week   ?? null,
        search_query:  data.search_query  ?? null,
        ...data,
      },
      { onConflict: "session_id" }
    );

    if (upsertErr) {
      // Fallback plain insert
      const { error: insertErr } = await supabase.from("visitor_analytics").insert({
        session_id,
        ip_address:    ip,
        hour_of_visit: data.hour_of_visit ?? null,
        day_of_week:   data.day_of_week   ?? null,
        search_query:  data.search_query  ?? null,
        ...data,
      });
      if (insertErr) {
        console.error("[track/visit] insert error:", insertErr.message);
        return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
      }
    }
  }

  if (action === "update") {
    const { error } = await supabase
      .from("visitor_analytics")
      .update({
        pages_visited:      data.pages_visited,
        products_viewed:    data.products_viewed    ?? [],
        categories_viewed:  data.categories_viewed  ?? [],
        time_spent_seconds: data.time_spent_seconds,
        max_scroll_depth:   data.max_scroll_depth   ?? 0,
        last_seen_at:       new Date().toISOString(),
      })
      .eq("session_id", session_id);

    if (error) console.error("[track/visit] update error:", error.message);
  }

  return NextResponse.json({ ok: true });
}
