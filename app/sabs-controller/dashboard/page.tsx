"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiPackage, FiPlusCircle, FiTrendingUp, FiStar,
  FiUsers, FiMessageCircle, FiEye, FiRefreshCw, FiShoppingBag,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

interface Stats {
  totalProducts: number; inStock: number; featured: number; trending: number;
  totalVisitors: number; returningVisitors: number; mobileVisitors: number;
  totalWaClicks: number; totalCustomers: number; totalReviews: number;
  avgScrollDepth: number; avgTimeSeconds: number;
  visitsByDay: { day: string; count: number }[];
  topCategories: { category: string; views: number }[];
  trafficSources: { source: string; count: number }[];
  peakHours: { hour: number; count: number }[];
  topProducts: { name: string; brand: string; clicks: number }[];
  categoryBreakdown: { category: string; count: number }[];
}

// ── Mini chart components (pure CSS/SVG — no external lib) ──────────────────

function BarChart({ data, color = "#C41E3A", height = 60 }: {
  data: { label: string; value: number }[]; color?: string; height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1 w-full" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
          <div
            className="w-full rounded-t-md transition-all duration-700 cursor-pointer"
            style={{
              height: `${Math.max((d.value / max) * (height - 14), d.value > 0 ? 4 : 0)}px`,
              background: `linear-gradient(180deg, ${color}dd, ${color}88)`,
              boxShadow: d.value > 0 ? `0 4px 12px ${color}44` : "none",
            }}
          />
          <span className="text-[8px] text-gray-400 truncate w-full text-center">{d.label}</span>
          {/* Tooltip */}
          <div className="absolute bottom-full mb-1 bg-gray-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
            {d.label}: {d.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ segments, size = 80 }: {
  segments: { label: string; value: number; color: string }[]; size?: number;
}) {
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const stroke = 10;
  let cumAngle = -90;
  const arcs = segments.map((seg) => {
    const angle = (seg.value / total) * 360;
    const start = cumAngle;
    cumAngle += angle;
    const startRad = (start * Math.PI) / 180;
    const endRad   = ((start + angle) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const large = angle > 180 ? 1 : 0;
    return { ...seg, path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, angle };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {arcs.map((a, i) => a.angle > 0 && (
        <path key={i} d={a.path} fill="none" stroke={a.color} strokeWidth={stroke}
          strokeLinecap="round" opacity={0.9}>
          <title>{a.label}: {a.value}</title>
        </path>
      ))}
      <circle cx={cx} cy={cy} r={r - stroke / 2 - 2} fill="white" opacity={0.05} />
    </svg>
  );
}

function MiniLineChart({ values, color = "#C41E3A", height = 40 }: {
  values: number[]; color?: string; height?: number;
}) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const w = 100;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => `${i * step},${height - (v / max) * (height - 4)}`).join(" ");
  const area = `0,${height} ` + points + ` ${w},${height}`;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color.replace("#","")})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => v > 0 && (
        <circle key={i} cx={i * step} cy={height - (v / max) * (height - 4)} r="2.5" fill={color} />
      ))}
    </svg>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, gradient, sub, sparkline }: {
  label: string; value: string | number; icon: React.ReactNode;
  gradient: string; sub?: string; sparkline?: number[];
}) {
  return (
    <div className={`relative rounded-2xl p-5 text-white overflow-hidden shadow-lg ${gradient}`}
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
      {/* 3D shine overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)" }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            {icon}
          </div>
          {sparkline && <div className="w-20 opacity-70"><MiniLineChart values={sparkline} color="white" height={28} /></div>}
        </div>
        <p className="text-3xl font-black leading-none mb-1">{value}</p>
        <p className="text-white/80 text-xs font-semibold">{label}</p>
        {sub && <p className="text-white/60 text-[10px] mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardHome() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0, inStock: 0, featured: 0, trending: 0,
    totalVisitors: 0, returningVisitors: 0, mobileVisitors: 0,
    totalWaClicks: 0, totalCustomers: 0, totalReviews: 0,
    avgScrollDepth: 0, avgTimeSeconds: 0,
    visitsByDay: [], topCategories: [], trafficSources: [],
    peakHours: [], topProducts: [], categoryBreakdown: [],
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadAll = async () => {
    setLoading(true);
    try {
      const [prodRes, visitorRes, waRes, custRes, reviewRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/visitors?days=30"),
        fetch("/api/admin/whatsapp-clicks?days=30"),
        fetch("/api/admin/customers"),
        fetch("/api/admin/reviews"),
      ]);
      const [prodData, visitorData, waData, custData, reviewData] = await Promise.all([
        prodRes.json(), visitorRes.json(), waRes.json(), custRes.json(), reviewRes.json(),
      ]);

      const products = prodData.data || [];
      const catBreak: Record<string, number> = {};
      products.forEach((p: { category: string }) => {
        catBreak[p.category] = (catBreak[p.category] || 0) + 1;
      });

      setStats({
        totalProducts:    products.length,
        inStock:          products.filter((p: { in_stock: boolean }) => p.in_stock).length,
        featured:         products.filter((p: { featured: boolean }) => p.featured).length,
        trending:         products.filter((p: { trending: boolean }) => p.trending).length,
        totalVisitors:    visitorData.stats?.total || 0,
        returningVisitors: visitorData.stats?.returning || 0,
        mobileVisitors:   visitorData.stats?.mobile || 0,
        avgScrollDepth:   visitorData.stats?.avgScrollDepth || 0,
        avgTimeSeconds:   visitorData.stats?.avgTimeSeconds || 0,
        totalWaClicks:    waData.total || 0,
        totalCustomers:   (custData.data || []).length,
        totalReviews:     (reviewData.data || []).length,
        visitsByDay:      visitorData.visitsByDay || [],
        topCategories:    visitorData.topCategories || [],
        trafficSources:   visitorData.trafficSources || [],
        peakHours:        visitorData.peakHours || [],
        topProducts:      (waData.topProducts || []).slice(0, 5),
        categoryBreakdown: Object.entries(catBreak).map(([category, count]) => ({ category, count }))
          .sort((a, b) => b.count - a.count).slice(0, 6),
      });
    } catch { /* ignore */ }
    setLoading(false);
    setLastRefresh(new Date());
  };

  useEffect(() => { loadAll(); }, []);

  const fmtTime = (s: number) => s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
  const hourLabel = (h: number) => h === 0 ? "12am" : h < 12 ? `${h}am` : h === 12 ? "12pm" : `${h - 12}pm`;

  const topStatCards = [
    { label: "Total Products", value: stats.totalProducts, icon: <FiPackage size={18} />, gradient: "bg-gradient-to-br from-[#1a1a2e] to-[#16213e]", sub: `${stats.inStock} in stock` },
    { label: "Visitors (30d)", value: stats.totalVisitors, icon: <FiEye size={18} />, gradient: "bg-gradient-to-br from-[#0f3460] to-[#533483]", sub: `${stats.returningVisitors} returning` },
    { label: "WhatsApp Orders", value: stats.totalWaClicks, icon: <FaWhatsapp size={18} />, gradient: "bg-gradient-to-br from-[#128C7E] to-[#075E54]", sub: "Last 30 days" },
    { label: "Customers", value: stats.totalCustomers, icon: <FiUsers size={18} />, gradient: "bg-gradient-to-br from-[#C41E3A] to-[#8B0000]", sub: `${stats.totalReviews} reviews` },
    { label: "Featured", value: stats.featured, icon: <FiStar size={18} />, gradient: "bg-gradient-to-br from-[#f7971e] to-[#ffd200]", sub: "Homepage products" },
    { label: "Trending", value: stats.trending, icon: <FiTrendingUp size={18} />, gradient: "bg-gradient-to-br from-[#ee0979] to-[#ff6a00]", sub: "Trending section" },
    { label: "Avg Scroll", value: `${stats.avgScrollDepth}%`, icon: <FiShoppingBag size={18} />, gradient: "bg-gradient-to-br from-[#2c3e50] to-[#3498db]", sub: "Page engagement" },
    { label: "Avg Visit Time", value: fmtTime(stats.avgTimeSeconds), icon: <FiMessageCircle size={18} />, gradient: "bg-gradient-to-br from-[#11998e] to-[#38ef7d]", sub: "Per session" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-400 text-xs mt-0.5">
            Last updated: {lastRefresh.toLocaleTimeString("en-IN")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAll} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <FiRefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Link href="/sabs-controller/dashboard/products/add"
            className="flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm shadow-md">
            <FiPlusCircle size={14} /> Add Product
          </Link>
        </div>
      </div>

      {/* Top Stat Cards — 4 cols on large, 2 on small */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {topStatCards.slice(0, 8).map((c, i) => (
          <StatCard key={i} {...c} />
        ))}
      </div>

      {/* Charts Row 1 — Visitors by day + Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Visitors by Day — bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Visitors by Day of Week</h3>
              <p className="text-[10px] text-gray-400">Last 30 days activity</p>
            </div>
            <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">{stats.totalVisitors} total</span>
          </div>
          {loading ? <div className="h-16 bg-gray-50 rounded-xl animate-pulse" /> : (
            <BarChart
              data={stats.visitsByDay.map((d) => ({ label: d.day, value: d.count }))}
              color="#C41E3A" height={72}
            />
          )}
        </div>

        {/* Traffic Sources — donut */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm mb-1">Traffic Sources</h3>
          <p className="text-[10px] text-gray-400 mb-3">Where visitors come from</p>
          {loading ? <div className="h-20 bg-gray-50 rounded-xl animate-pulse" /> : (
            <div className="flex items-center gap-3">
              <DonutChart size={80} segments={stats.trafficSources.slice(0, 5).map((s, i) => ({
                label: s.source, value: s.count,
                color: ["#C41E3A","#128C7E","#0f3460","#f7971e","#533483"][i % 5],
              }))} />
              <div className="flex-1 space-y-1.5">
                {stats.trafficSources.slice(0, 5).map((s, i) => {
                  const total = stats.trafficSources.slice(0, 5).reduce((a, x) => a + x.count, 0) || 1;
                  const colors = ["bg-brand-primary","bg-green-600","bg-blue-700","bg-yellow-500","bg-purple-600"];
                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[i % 5]}`} />
                      <span className="text-[10px] text-gray-600 flex-1 truncate capitalize">{s.source}</span>
                      <span className="text-[10px] font-bold text-gray-800">{Math.round((s.count / total) * 100)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 — Category Breakdown + Peak Hours + WhatsApp Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Product Category Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm mb-1">Products by Category</h3>
          <p className="text-[10px] text-gray-400 mb-3">Inventory breakdown</p>
          {loading ? <div className="h-16 bg-gray-50 rounded-xl animate-pulse" /> : (
            <div className="space-y-2">
              {stats.categoryBreakdown.map((c, i) => {
                const max = stats.categoryBreakdown[0]?.count || 1;
                const colors = ["from-brand-primary to-pink-400","from-blue-500 to-cyan-400","from-green-500 to-emerald-400","from-yellow-500 to-orange-400","from-purple-500 to-violet-400","from-teal-500 to-green-400"];
                return (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span className="text-gray-600 font-semibold truncate">{c.category}</span>
                      <span className="text-gray-800 font-bold">{c.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${colors[i % colors.length]} transition-all duration-700`}
                        style={{ width: `${(c.count / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Peak Hours */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm mb-1">🔥 Peak Visit Hours</h3>
          <p className="text-[10px] text-gray-400 mb-3">Best time for WhatsApp campaigns</p>
          {loading ? <div className="h-16 bg-gray-50 rounded-xl animate-pulse" /> : stats.peakHours.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No data yet</p>
          ) : (
            <div className="space-y-2">
              {stats.peakHours.map((h, i) => {
                const max = stats.peakHours[0]?.count || 1;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 w-10 flex-shrink-0">{hourLabel(h.hour)}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-700"
                        style={{ width: `${(h.count / max) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-orange-500 w-6">{h.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top WhatsApp Products */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm mb-1">
            <FaWhatsapp className="inline text-green-500 mr-1" size={13} /> Top Ordered Products
          </h3>
          <p className="text-[10px] text-gray-400 mb-3">By WhatsApp clicks (30d)</p>
          {loading ? <div className="h-16 bg-gray-50 rounded-xl animate-pulse" /> : stats.topProducts.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No orders tracked yet</p>
          ) : (
            <div className="space-y-2">
              {stats.topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center text-white flex-shrink-0 ${
                    i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : "bg-orange-400"}`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-[9px] text-gray-400">{p.brand}</p>
                  </div>
                  <span className="text-xs font-black text-green-600">{p.clicks}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row — Visitor Interest Categories + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Visitor Category Interest */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm mb-1">🛍 Visitor Category Interest</h3>
          <p className="text-[10px] text-gray-400 mb-3">What visitors are browsing</p>
          {loading ? <div className="h-16 bg-gray-50 rounded-xl animate-pulse" /> : stats.topCategories.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No browse data yet</p>
          ) : (
            <BarChart
              data={stats.topCategories.slice(0, 6).map((c) => ({ label: c.category.replace(/\s+/g, "\n").slice(0, 8), value: c.views }))}
              color="#0f3460" height={72}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-800 text-sm mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: "/sabs-controller/dashboard/products/add", label: "Add Product", icon: <FiPlusCircle />, color: "bg-brand-light text-brand-primary hover:bg-pink-100" },
              { href: "/sabs-controller/dashboard/products", label: "All Products", icon: <FiPackage />, color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
              { href: "/sabs-controller/dashboard/visitors", label: "Visitor Analytics", icon: <FiEye />, color: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
              { href: "/sabs-controller/dashboard/whatsapp-analytics", label: "WhatsApp Stats", icon: <FaWhatsapp />, color: "bg-green-50 text-green-600 hover:bg-green-100" },
              { href: "/sabs-controller/dashboard/customers", label: "Customers", icon: <FiUsers />, color: "bg-orange-50 text-orange-600 hover:bg-orange-100" },
              { href: "/sabs-controller/dashboard/reviews", label: "Reviews", icon: <FiStar />, color: "bg-yellow-50 text-yellow-600 hover:bg-yellow-100" },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className={`flex items-center gap-2 p-3 rounded-xl transition-colors text-xs font-semibold ${a.color}`}>
                <span className="text-base">{a.icon}</span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
