/**
 * One-time migration: Add weight_kg, image_alt_text, short_url columns to products
 */
import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const projectRef = url.replace("https://", "").replace(".supabase.co", "");

  const SQL = `
    ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(6,3) DEFAULT 0.3;
    ALTER TABLE products ADD COLUMN IF NOT EXISTS image_alt_text TEXT DEFAULT '';
    ALTER TABLE products ADD COLUMN IF NOT EXISTS short_url TEXT DEFAULT '';
  `;

  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${svcKey}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({ query: SQL }),
  });

  const body = await res.json().catch(() => ({}));

  if (res.ok) {
    return NextResponse.json({ success: true, message: "✅ Columns added: weight_kg, image_alt_text, short_url" });
  }

  // Fallback: try upsert with the new fields to force schema cache refresh
  // Supabase REST API doesn't support DDL but we can use the pg endpoint
  const pgRes = await fetch(`${url}/pg/query`, {
    method:  "POST",
    headers: {
      "Authorization": `Bearer ${svcKey}`,
      "apikey":        svcKey,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({ query: SQL }),
  });
  const pgBody = await pgRes.json().catch(() => ({}));

  return NextResponse.json({
    success: false,
    management_api: { status: res.status, error: (body as Record<string, unknown>)?.message },
    pg_endpoint:    { status: pgRes.status, error: (pgBody as Record<string, unknown>)?.message },
    sql_to_run_manually: SQL,
    instructions: "Please run the sql_to_run_manually in Supabase Dashboard > SQL Editor",
  });
}
