import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  // sendBeacon sends text/plain, fetch sends application/json — handle both
  let body: Record<string, unknown>;
  try {
    const text = await req.text();
    body = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { action, session_id, ...data } = body as { action: string; session_id: string; [key: string]: unknown };

  if (action === "start") {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || "unknown";

    await supabase.from("visitor_analytics").upsert({
      session_id,
      ip_address: ip,
      ...data,
    }, { onConflict: "session_id" });
  }

  if (action === "update") {
    await supabase.from("visitor_analytics")
      .update({
        pages_visited:      data.pages_visited,
        time_spent_seconds: data.time_spent_seconds,
        last_seen_at:       new Date().toISOString(),
      })
      .eq("session_id", session_id);
  }

  return NextResponse.json({ ok: true });
}
