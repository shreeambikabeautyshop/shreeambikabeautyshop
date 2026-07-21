import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}
const getAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = getAdmin();
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "30");

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("visitor_analytics")
    .select("*")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const visitors = data || [];
  const stats = {
    total: visitors.length,
    returning: visitors.filter((v) => v.is_returning).length,
    mobile: visitors.filter((v) => v.device_type === "mobile").length,
    desktop: visitors.filter((v) => v.device_type === "desktop").length,
    tablet: visitors.filter((v) => v.device_type === "tablet").length,
    countries: [...new Set(visitors.map((v) => v.country).filter(Boolean))].length,
    avgTimeSeconds: visitors.length
      ? Math.round(visitors.reduce((s, v) => s + (v.time_spent_seconds || 0), 0) / visitors.length)
      : 0,
  };

  return NextResponse.json({ data: visitors, stats });
}
