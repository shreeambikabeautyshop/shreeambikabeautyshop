import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { classifyVisitor } from "@/lib/botClassifier";

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

  // ── ACTION: start ─────────────────────────────────────────────────────────
  if (action === "start") {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const ua      = req.headers.get("user-agent") || "unknown";
    const city    = (data.city    as string) || "";
    const country = (data.country as string) || "";
    const isp     = (data.isp     as string) || "";

    // ── Classify: human / good_bot / bad_bot ─────────────────────────────
    const classification = await classifyVisitor({ ua, ip, city, country, isp });

    // Block bad bots entirely — don't save to DB, return 200 silently
    if (classification.type === "bad_bot") {
      console.log(`[track] blocked bad_bot ip=${ip} city=${city} reason=${classification.reason}`);
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Good bots get saved but flagged — they inflate numbers otherwise
    // Real humans also get saved (visitor_type = "human")
    const { error: upsertErr } = await supabase.from("visitor_analytics").upsert(
      {
        session_id,
        ip_address:      ip,
        user_agent:      ua,
        visitor_type:    classification.type,       // "human" | "good_bot"
        bot_reason:      classification.type !== "human" ? classification.reason : null,
        hour_of_visit:   data.hour_of_visit ?? null,
        day_of_week:     data.day_of_week   ?? null,
        search_query:    data.search_query  ?? null,
        ...data,
      },
      { onConflict: "session_id" }
    );

    if (upsertErr) {
      const { error: insertErr } = await supabase.from("visitor_analytics").insert({
        session_id,
        ip_address:      ip,
        user_agent:      ua,
        visitor_type:    classification.type,
        bot_reason:      classification.type !== "human" ? classification.reason : null,
        hour_of_visit:   data.hour_of_visit ?? null,
        day_of_week:     data.day_of_week   ?? null,
        search_query:    data.search_query  ?? null,
        ...data,
      });
      if (insertErr) {
        console.error("[track/visit] insert error:", insertErr.message);
        return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 });
      }
    }
  }

  // ── ACTION: update ────────────────────────────────────────────────────────
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
