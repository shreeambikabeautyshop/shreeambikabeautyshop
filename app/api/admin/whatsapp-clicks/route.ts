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
    .from("whatsapp_clicks")
    .select("*")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Group by product for stats
  const byProduct: Record<string, { name: string; brand: string; price: number; clicks: number }> = {};
  (data || []).forEach((c) => {
    const key = c.product_id || c.product_name;
    if (!byProduct[key]) {
      byProduct[key] = { name: c.product_name, brand: c.product_brand, price: c.product_price, clicks: 0 };
    }
    byProduct[key].clicks++;
  });

  const topProducts = Object.values(byProduct)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 20);

  return NextResponse.json({ data, topProducts, total: data?.length || 0 });
}
