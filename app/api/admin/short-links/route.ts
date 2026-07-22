import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

const getAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = getAdmin();

  const { data: links, error } = await supabase
    .from("short_links")
    .select("*")
    .order("clicks", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get click breakdown by source for each link
  const { data: clickData } = await supabase
    .from("short_link_clicks")
    .select("link_id, source, created_at")
    .order("created_at", { ascending: false })
    .limit(2000);

  const clicksByLink: Record<string, Record<string, number>> = {};
  (clickData || []).forEach((c) => {
    if (!clicksByLink[c.link_id]) clicksByLink[c.link_id] = {};
    clicksByLink[c.link_id][c.source] = (clicksByLink[c.link_id][c.source] || 0) + 1;
  });

  const totalClicks  = (links || []).reduce((s, l) => s + (l.clicks || 0), 0);
  const totalLinks   = (links || []).length;

  return NextResponse.json({ links, clicksByLink, totalClicks, totalLinks });
}
