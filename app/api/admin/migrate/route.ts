import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

// One-time migration endpoint — creates sabs_orders table if not exists
export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if table exists by trying to select from it
  const { error: checkErr } = await supabase.from("sabs_orders").select("id").limit(1);

  if (!checkErr) {
    return NextResponse.json({ success: true, message: "Table already exists" });
  }

  // Table doesn't exist — create via raw SQL using pg function
  // Supabase allows running raw SQL via the `sql` RPC if pg_net is enabled
  // Fallback: use the Supabase SQL API endpoint
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const sql = `
    create table if not exists sabs_orders (
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
  `;

  // Use Supabase SQL endpoint (available on all plans)
  const res = await fetch(`${url}/rest/v1/`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${svcKey}`,
      "apikey": svcKey,
      "Content-Type": "application/json",
      "Content-Profile": "public",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    // Try alternative: use pg extension via RPC
    const { error: sqlErr } = await supabase.rpc("exec_sql", { sql });
    if (sqlErr) {
      return NextResponse.json({
        error: "Cannot auto-create table. Please run SQL manually in Supabase dashboard.",
        sql,
        supabase_error: sqlErr.message,
      }, { status: 500 });
    }
  }

  // Verify table now exists
  const { error: verifyErr } = await supabase.from("sabs_orders").select("id").limit(1);
  if (verifyErr) {
    return NextResponse.json({
      error: "Table creation failed. Run SQL manually.",
      sql,
    }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: "sabs_orders table created!" });
}
