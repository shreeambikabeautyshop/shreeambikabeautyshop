import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { action, session_id, ...data } = body;

  if (action === "start") {
    // Get IP from request headers
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
        pages_visited: data.pages_visited,
        time_spent_seconds: data.time_spent_seconds,
        last_seen_at: new Date().toISOString(),
      })
      .eq("session_id", session_id);
  }

  return NextResponse.json({ ok: true });
}
