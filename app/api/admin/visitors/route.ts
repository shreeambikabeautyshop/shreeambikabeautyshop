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

  // ── Basic stats ──────────────────────────────────────────────
  const stats = {
    total:          visitors.length,
    returning:      visitors.filter((v) => v.is_returning).length,
    mobile:         visitors.filter((v) => v.device_type === "mobile").length,
    desktop:        visitors.filter((v) => v.device_type === "desktop").length,
    tablet:         visitors.filter((v) => v.device_type === "tablet").length,
    countries:      [...new Set(visitors.map((v) => v.country).filter(Boolean))].length,
    avgTimeSeconds: visitors.length
      ? Math.round(visitors.reduce((s, v) => s + (v.time_spent_seconds || 0), 0) / visitors.length)
      : 0,
    avgScrollDepth: visitors.length
      ? Math.round(visitors.reduce((s, v) => s + (v.max_scroll_depth || 0), 0) / visitors.length)
      : 0,
  };

  // ── Top cities (for reaching customers) ──────────────────────
  const cityCount: Record<string, { count: number; country: string; country_code: string }> = {};
  visitors.forEach((v) => {
    const city = v.city || v.region || v.country;
    if (!city) return;
    if (!cityCount[city]) cityCount[city] = { count: 0, country: v.country || "", country_code: v.country_code || "" };
    cityCount[city].count++;
  });
  const topCities = Object.entries(cityCount)
    .map(([city, d]) => ({ city, ...d }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ── Top products viewed (interest signals) ───────────────────
  const productCount: Record<string, number> = {};
  visitors.forEach((v) => {
    (v.products_viewed || []).forEach((slug: string) => {
      productCount[slug] = (productCount[slug] || 0) + 1;
    });
  });
  const topProductsViewed = Object.entries(productCount)
    .map(([slug, views]) => ({ slug, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // ── Top categories viewed ─────────────────────────────────────
  const catCount: Record<string, number> = {};
  visitors.forEach((v) => {
    (v.categories_viewed || []).forEach((cat: string) => {
      catCount[cat] = (catCount[cat] || 0) + 1;
    });
  });
  const topCategories = Object.entries(catCount)
    .map(([category, views]) => ({ category, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);

  // ── Peak hours (when to send WhatsApp campaigns) ─────────────
  const hourCount: Record<number, number> = {};
  visitors.forEach((v) => {
    if (v.hour_of_visit != null) {
      hourCount[v.hour_of_visit] = (hourCount[v.hour_of_visit] || 0) + 1;
    }
  });
  const peakHours = Object.entries(hourCount)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ── Traffic sources breakdown ────────────────────────────────
  const sourceCount: Record<string, number> = {};
  visitors.forEach((v) => {
    const src = v.utm_source || (v.referrer ? new URL(v.referrer).hostname.replace("www.", "") : "Direct");
    sourceCount[src] = (sourceCount[src] || 0) + 1;
  });
  const trafficSources = Object.entries(sourceCount)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // ── Search queries ───────────────────────────────────────────
  const searchCount: Record<string, number> = {};
  visitors.forEach((v) => {
    if (v.search_query) {
      searchCount[v.search_query] = (searchCount[v.search_query] || 0) + 1;
    }
  });
  const topSearches = Object.entries(searchCount)
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // ── Day of week breakdown ────────────────────────────────────
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayCount: Record<number, number> = {};
  visitors.forEach((v) => {
    if (v.day_of_week != null) {
      dayCount[v.day_of_week] = (dayCount[v.day_of_week] || 0) + 1;
    }
  });
  const visitsByDay = dayNames.map((name, i) => ({ day: name, count: dayCount[i] || 0 }));

  return NextResponse.json({
    data: visitors,
    stats,
    topCities,
    topProductsViewed,
    topCategories,
    peakHours,
    trafficSources,
    topSearches,
    visitsByDay,
  });
}
