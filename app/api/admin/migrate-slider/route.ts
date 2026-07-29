import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if table already exists
  const { error: checkErr } = await supabase.from("slider_history").select("id").limit(1);
  if (!checkErr) {
    return NextResponse.json({ success: true, message: "Table already exists ✅" });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const projectRef = url.replace("https://", "").replace(".supabase.co", "");

  const createSQL = `
    create table if not exists public.slider_history (
      id          uuid default gen_random_uuid() primary key,
      slide_index integer not null,
      image_url   text not null,
      alt         text default '',
      changed_at  timestamptz default now()
    );
    grant all on public.slider_history to service_role;
    grant all on public.slider_history to authenticated;
    grant select on public.slider_history to anon;
  `;

  const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${svcKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: createSQL }),
  });

  if (mgmtRes.ok) {
    const verify = await supabase.from("slider_history").select("id").limit(1);
    if (!verify.error) {
      return NextResponse.json({ success: true, message: "slider_history table created ✅" });
    }
  }

  const mgmtBody = await mgmtRes.text().catch(() => "");
  return NextResponse.json({
    success: false,
    message: "Run this SQL manually in Supabase SQL Editor",
    sql: createSQL,
    mgmt_status: mgmtRes.status,
    mgmt_error: mgmtBody.slice(0, 300),
  }, { status: 500 });
}
