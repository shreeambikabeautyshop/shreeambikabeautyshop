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

  // Check if table exists
  const { error: checkErr } = await supabase.from("sabs_orders").select("id").limit(1);
  if (!checkErr) {
    return NextResponse.json({ success: true, message: "Table already exists ✅" });
  }

  // Table doesn't exist — we need to create it
  // Supabase service role can insert into any table but can't run DDL via REST
  // Solution: create a minimal stored function via the rpc endpoint
  
  // Step 1: Try to create via the Supabase Management API using project's pg connection
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const projectRef = url.replace("https://", "").replace(".supabase.co", "");

  // Try Supabase Management API (needs management token, but let's try service key)
  const createSQL = `
    create table if not exists public.sabs_orders (
      id                  uuid default gen_random_uuid() primary key,
      sabs_order_id       text not null,
      shiprocket_order_id text,
      shipment_id         text,
      awb                 text,
      courier_name        text,
      estimated_delivery  text,
      customer_name       text not null,
      customer_phone      text,
      product_name        text,
      product_price       numeric,
      delivery_address    text,
      delivery_pincode    text,
      delivery_city       text,
      delivery_state      text,
      status              text default 'new',
      source              text default 'whatsapp',
      manifest_url        text,
      label_url           text,
      created_at          timestamptz default now(),
      updated_at          timestamptz
    );
    grant all on public.sabs_orders to service_role;
    grant all on public.sabs_orders to authenticated;
    grant all on public.sabs_orders to anon;
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
    const verify = await supabase.from("sabs_orders").select("id").limit(1);
    if (!verify.error) {
      return NextResponse.json({ success: true, message: "Table created via Management API ✅" });
    }
  }

  const mgmtBody = await mgmtRes.text().catch(() => "");
  
  return NextResponse.json({
    success: false,
    message: "Cannot auto-create table. Please run SQL manually in Supabase SQL Editor.",
    mgmt_status: mgmtRes.status,
    mgmt_error: mgmtBody.slice(0, 300),
    sql: createSQL,
  }, { status: 500 });
}
