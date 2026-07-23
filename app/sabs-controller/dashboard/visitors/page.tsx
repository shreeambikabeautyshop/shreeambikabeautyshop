"use client";
import { useEffect, useState, useMemo } from "react";
import { FiUsers, FiGlobe, FiSmartphone, FiMonitor, FiRefreshCw, FiClock, FiSearch, FiTrendingUp, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { MdRepeat } from "react-icons/md";
import { FaWhatsapp } from "react-icons/fa";

interface Visitor {
  id: string; session_id: string; ip_address: string;
  country: string; country_code: string; region: string; city: string;
  latitude: number; longitude: number; timezone: string; isp: string;
  device_type: string; os: string; browser: string;
  screen_width: number; screen_height: number;
  referrer: string; utm_source: string; utm_medium: string; utm_campaign: string;
  landing_page: string; pages_visited: string[];
  products_viewed: string[]; categories_viewed: string[];
  time_spent_seconds: number; max_scroll_depth: number; is_returning: boolean;
  search_query: string; hour_of_visit: number; day_of_week: number;
  created_at: string; last_seen_at: string;
}

interface Stats {
  total: number; returning: number; mobile: number; desktop: number;
  tablet: number; countries: number; avgTimeSeconds: number; avgScrollDepth: number;
}

interface CityData    { city: string; count: number; country: string; country_code: string }
interface ProductView { slug: string; views: number }
interface CatView     { category: string; views: number }
interface PeakHour    { hour: number; count: number }
interface TrafficSrc  { source: string; count: number }
interface SearchQ     { query: string; count: number }
interface DayCount    { day: string; count: number }

const DAYS_OPTIONS = [7, 14, 30, 90];

export default function VisitorsPage() {
  const [visitors, setVisitors]         = useState<Visitor[]>([]);
  const [stats, setStats]               = useState<Stats | null>(null);
  const [topCities, setTopCities]       = useState<CityData[]>([]);
  const [topProducts, setTopProducts]   = useState<ProductView[]>([]);
  const [topCats, setTopCats]           = useState<CatView[]>([]);
  const [peakHours, setPeakHours]       = useState<PeakHour[]>([]);
  const [trafficSrc, setTrafficSrc]     = useState<TrafficSrc[]>([]);
  const [topSearches, setTopSearches]   = useState<SearchQ[]>([]);
  const [visitsByDay, setVisitsByDay]   = useState<DayCount[]>([]);
  const [loading, setLoading]           = useState(true);
  const [days, setDays]                 = useState(30);
  const [selected, setSelected]         = useState<Visitor | null>(null);
  const [tab, setTab]                   = useState<"overview"|"products"|"reach"|"visitors">("overview");
  const [page, setPage]                 = useState(1);
  const [visitorSearch, setVisitorSearch] = useState("");
  const [goodBotCount, setGoodBotCount] = useState(0);
  const PAGE_SIZE = 25;

  const load = async (d: number) => {
    setLoading(true);
    const res  = await fetch(`/api/admin/visitors?days=${d}`);
    const json = await res.json();
    setVisitors(json.data         || []);
    setStats(json.stats           || null);
    setTopCities(json.topCities   || []);
    setTopProducts(json.topProductsViewed || []);
    setTopCats(json.topCategories || []);
    setPeakHours(json.peakHours   || []);
    setTrafficSrc(json.trafficSources || []);
    setGoodBotCount(json.goodBotCount || 0);
    // Fix: filter out URL template strings from search queries
    const rawSearches: SearchQ[] = json.topSearches || [];
    setTopSearches(rawSearches.filter(s => s.query && !s.query.includes("{") && s.query.trim().length > 1));
    setVisitsByDay(json.visitsByDay   || []);
    setLoading(false);
  };

  useEffect(() => { load(days); }, [days]);

  // Filtered + paginated visitors
  const filteredVisitors = useMemo(() => {
    if (!visitorSearch.trim()) return visitors;
    const q = visitorSearch.toLowerCase();
    return visitors.filter(v =>
      (v.city || "").toLowerCase().includes(q) ||
      (v.country || "").toLowerCase().includes(q) ||
      (v.ip_address || "").includes(q) ||
      (v.browser || "").toLowerCase().includes(q) ||
      (v.os || "").toLowerCase().includes(q)
    );
  }, [visitors, visitorSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredVisitors.length / PAGE_SIZE));
  const pagedVisitors = filteredVisitors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const fmt = (secs: number) => {
    if (!secs) return "< 1s";
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  };

  const flag = (code: string) => {
    if (!code || code.length < 2) return "🌍";
    return String.fromCodePoint(
      0x1f1e6 + code.toUpperCase().charCodeAt(0) - 65,
      0x1f1e6 + code.toUpperCase().charCodeAt(1) - 65
    );
  };

  const hourLabel = (h: number) => {
    if (h === 0)  return "12am";
    if (h < 12)   return `${h}am`;
    if (h === 12) return "12pm";
    return `${h - 12}pm`;
  };

  const waReach = (city: string) =>
    `https://wa.me/918291455297?text=${encodeURIComponent(`Hi Vinod! I visited your beauty store from ${city} and I am interested in beauty products.`)}`;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FiUsers size={22} className="text-brand-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customer Visits</h1>
            <p className="text-gray-500 text-sm mt-0.5">Track every visitor — device, location, interests, reach</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {DAYS_OPTIONS.map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${days === d ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {d}d
            </button>
          ))}
          <button onClick={() => load(days)} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
            <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3 mb-6">
          {[
            { icon: <FiUsers size={16} />,     label: "Total Sessions",  val: stats.total,                     color: "text-blue-600 bg-blue-50",    tip: "All visits in this period" },
            { icon: <MdRepeat size={16} />,    label: "New Visitors",    val: stats.total - stats.returning,   color: "text-green-600 bg-green-50",  tip: "First-time visitors (included in total)" },
            { icon: <FiSmartphone size={16} />,label: "Mobile",          val: stats.mobile,                    color: "text-purple-600 bg-purple-50", tip: "Visited on mobile phone" },
            { icon: <FiMonitor size={16} />,   label: "Desktop",         val: stats.desktop,                   color: "text-orange-600 bg-orange-50", tip: "Visited on desktop/laptop" },
            { icon: <span className="text-sm">📱</span>, label: "Tablet", val: stats.tablet,                   color: "text-pink-600 bg-pink-50",    tip: "Visited on tablet" },
            { icon: <FiGlobe size={16} />,     label: "Countries",       val: stats.countries,                 color: "text-teal-600 bg-teal-50",    tip: "Unique countries" },
            { icon: <FiClock size={16} />,     label: "Avg Time",        val: fmt(stats.avgTimeSeconds),       color: "text-brand-primary bg-brand-light", tip: "Average time per visit" },
            { icon: <FiTrendingUp size={16} />,label: "Avg Scroll",      val: `${stats.avgScrollDepth || 0}%`, color: "text-indigo-600 bg-indigo-50", tip: "How deep visitors scroll" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm relative group">
              <div className={`w-8 h-8 rounded-xl ${s.color} flex items-center justify-center mb-2`}>{s.icon}</div>
              <p className="text-lg font-bold text-gray-800">{s.val}</p>
              <p className="text-[10px] text-gray-500">{s.label}</p>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-[9px] px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                {s.tip}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New vs Returning breakdown bar */}
      {stats && stats.total > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-700">New vs Returning Visitors</p>
            <p className="text-[10px] text-gray-400">{stats.total} total sessions</p>
          </div>
          <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
            <div className="bg-green-500 rounded-l-full transition-all duration-700"
              style={{ width: `${Math.round(((stats.total - stats.returning) / stats.total) * 100)}%` }} />
            <div className="bg-purple-400 rounded-r-full transition-all duration-700"
              style={{ width: `${Math.round((stats.returning / stats.total) * 100)}%` }} />
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-[10px] text-gray-600">New: <strong>{stats.total - stats.returning}</strong> ({Math.round(((stats.total - stats.returning) / stats.total) * 100)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 flex-shrink-0" />
              <span className="text-[10px] text-gray-600">Returning: <strong>{stats.returning}</strong> ({Math.round((stats.returning / stats.total) * 100)}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-gray-100 pb-3 flex-wrap">
        {(["overview","products","reach","visitors"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${tab === t ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t === "overview" ? "📊 Overview" : t === "products" ? "🛍 Product Interest" : t === "reach" ? "📍 Reach Customers" : "👁 All Visitors"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

            {/* Traffic Sources */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FiGlobe size={15} className="text-brand-primary" /> Traffic Sources</h3>
              {trafficSrc.length === 0 ? <p className="text-xs text-gray-400">No data yet</p> : (
                <div className="space-y-2.5">
                  {trafficSrc.map((s, i) => {
                    const max = trafficSrc[0]?.count || 1;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-gray-700 capitalize">{s.source}</span>
                          <span className="text-gray-500">{s.count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-primary rounded-full" style={{ width: `${(s.count / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Peak Hours — when to send WhatsApp campaigns */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2"><FiClock size={15} className="text-orange-500" /> Peak Visit Hours</h3>
              <p className="text-[10px] text-gray-400 mb-4">Best time to send WhatsApp promotions</p>
              {peakHours.length === 0 ? <p className="text-xs text-gray-400">No data yet</p> : (
                <div className="space-y-2.5">
                  {peakHours.map((h, i) => {
                    const max = peakHours[0]?.count || 1;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-gray-700">🕐 {hourLabel(h.hour)}</span>
                          <span className="text-orange-500 font-bold">{h.count} visitors</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-orange-400 rounded-full" style={{ width: `${(h.count / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Days of Week */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">📅 Visits by Day</h3>
              <div className="flex items-end gap-1.5 h-24">
                {visitsByDay.map((d) => {
                  const max = Math.max(...visitsByDay.map((x) => x.count), 1);
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-brand-primary rounded-t-md transition-all"
                        style={{ height: `${(d.count / max) * 80}px`, minHeight: d.count ? "4px" : "0" }} />
                      <span className="text-[9px] text-gray-500">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Search Queries */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm col-span-full md:col-span-1">
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2"><FiSearch size={15} className="text-blue-500" /> What Visitors Search</h3>
              <p className="text-[10px] text-gray-400 mb-4">Stock these products to increase sales</p>
              {topSearches.length === 0 ? <p className="text-xs text-gray-400">No searches tracked yet</p> : (
                <div className="space-y-1.5">
                  {topSearches.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-1.5">
                      <span className="text-xs font-semibold text-blue-700">&quot;{s.query}&quot;</span>
                      <span className="text-xs text-blue-500 font-bold">{s.count}x</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── PRODUCT INTEREST TAB ── */}
        {tab === "products" && (
          <div className="grid md:grid-cols-2 gap-5">

            {/* Top Products Viewed */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">🔥 Most Viewed Products</h3>
              <p className="text-[10px] text-gray-400 mb-4">Visitors are interested in these — promote via WhatsApp</p>
              {topProducts.length === 0 ? <p className="text-xs text-gray-400">No product views tracked yet</p> : (
                <div className="space-y-2.5">
                  {topProducts.map((p, i) => {
                    const max = topProducts[0]?.views || 1;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-gray-700 truncate max-w-[200px]">#{i+1} {p.slug.replace(/-/g, " ")}</span>
                          <span className="text-brand-primary font-bold flex-shrink-0 ml-2">{p.views} views</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-brand-primary to-pink-400 rounded-full" style={{ width: `${(p.views / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Categories */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-1 flex items-center gap-2">🏷 Top Categories Browsed</h3>
              <p className="text-[10px] text-gray-400 mb-4">Know what type of beauty products people want</p>
              {topCats.length === 0 ? <p className="text-xs text-gray-400">No category views yet</p> : (
                <div className="grid grid-cols-2 gap-2">
                  {topCats.map((c, i) => (
                    <div key={i} className="bg-brand-light rounded-xl px-3 py-2.5 flex items-center justify-between">
                      <span className="text-xs font-semibold text-brand-primary capitalize">{c.category.replace(/-/g, " ")}</span>
                      <span className="text-xs font-bold text-gray-600 bg-white px-1.5 py-0.5 rounded-lg">{c.views}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── REACH CUSTOMERS TAB ── */}
        {tab === "reach" && (
          <div className="space-y-5">
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <p className="text-sm font-bold text-green-800 flex items-center gap-2"><FaWhatsapp size={16} /> WhatsApp Reach Strategy</p>
              <p className="text-xs text-green-700 mt-1">These are real cities where your visitors came from. Click &quot;Message&quot; to open a pre-filled WhatsApp to promote your products to that area.</p>
            </div>

            {/* City-wise visitor table with WhatsApp reach button */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h3 className="font-bold text-gray-800">📍 Visitors by City — Direct Reach</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Use this to target specific cities with WhatsApp product promotions</p>
              </div>
              {topCities.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No location data yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-xs">
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">#</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">City</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Country</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Visitors</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Reach</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCities.map((c, i) => (
                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-5 py-3 text-xs text-gray-400">#{i+1}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <span>{flag(c.country_code)}</span>
                              <span className="font-semibold text-gray-800 text-xs">{c.city}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-500">{c.country}</td>
                          <td className="px-5 py-3">
                            <span className="bg-brand-light text-brand-primary text-xs font-bold px-2 py-0.5 rounded-full">{c.count}</span>
                          </td>
                          <td className="px-5 py-3">
                            <a href={waReach(c.city)} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-colors">
                              <FaWhatsapp size={11} /> Message
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── ALL VISITORS TAB ── */}
        {tab === "visitors" && (
          <div className="space-y-4">
            {/* Controls bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 flex-1 min-w-[180px]">
                <FiSearch size={13} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search city, country, IP, browser..."
                  value={visitorSearch}
                  onChange={(e) => { setVisitorSearch(e.target.value); setPage(1); }}
                  className="bg-transparent outline-none text-xs text-gray-700 flex-1"
                />
                {visitorSearch && (
                  <button onClick={() => setVisitorSearch("")} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                )}
              </div>
              {/* Count info */}
              <div className="text-xs text-gray-500">
                <span className="font-bold text-gray-800">{filteredVisitors.length}</span> real humans
              </div>
            </div>

            {/* AI filter info banner */}
            <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-start gap-2">
              <span className="text-green-600 text-lg">🤖</span>
              <div>
                <p className="text-xs font-bold text-green-800">
                  AI Bot Filter Active — showing only real human visitors
                </p>
                <p className="text-[10px] text-green-600 mt-0.5">
                  Bad bots (scrapers, attackers) are blocked at entry — never saved. 
                  {goodBotCount > 0 && <> Good bots (Googlebot, SEO crawlers): <strong>{goodBotCount}</strong> — saved separately, not counted here.</>}
                  {goodBotCount === 0 && <> Good SEO bots are saved but not counted in your stats.</>}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {filteredVisitors.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <FiUsers size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No visitors found.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-xs">
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Location</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Device</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Source</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Landing</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Products</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Time</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Scroll</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedVisitors.map((v) => (
                          <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => setSelected(v)}>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-base">{flag(v.country_code)}</span>
                                <div>
                                  <p className="font-semibold text-gray-800 text-xs">{v.city || v.region || v.country || "Unknown"}</p>
                                  <p className="text-[10px] text-gray-400">{v.country}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1">
                                {v.device_type === "mobile" ? <FiSmartphone size={12} className="text-green-500" /> : <FiMonitor size={12} className="text-blue-500" />}
                                <span className="text-xs text-gray-600 capitalize">{v.device_type}</span>
                              </div>
                              <p className="text-[10px] text-gray-400">{v.browser} / {v.os}</p>
                            </td>
                            <td className="px-4 py-2.5">
                              {v.utm_source
                                ? <span className="text-xs bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-full">{v.utm_source}</span>
                                : v.referrer
                                  ? <span className="text-xs text-gray-500">{v.referrer.replace("https://","").slice(0,20)}</span>
                                  : <span className="text-xs text-gray-300">Direct</span>}
                            </td>
                            <td className="px-4 py-2.5 text-xs text-gray-600 truncate max-w-[80px]">{v.landing_page || "/"}</td>
                            <td className="px-4 py-2.5">
                              <span className="text-xs font-bold text-brand-primary">{v.products_viewed?.length || 0}</span>
                              <span className="text-[10px] text-gray-400 ml-0.5">products</span>
                            </td>
                            <td className="px-4 py-2.5 text-xs font-semibold text-gray-700">{fmt(v.time_spent_seconds)}</td>
                            <td className="px-4 py-2.5">
                              <span className={`text-xs font-bold ${(v.max_scroll_depth || 0) >= 75 ? "text-green-600" : (v.max_scroll_depth || 0) >= 40 ? "text-orange-500" : "text-gray-400"}`}>
                                {v.max_scroll_depth || 0}%
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              {v.is_returning
                                ? <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-full">Return</span>
                                : <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">New</span>}
                            </td>
                            <td className="px-4 py-2.5 text-[10px] text-gray-400">
                              {new Date(v.created_at).toLocaleDateString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                    <p className="text-xs text-gray-500">
                      Showing <strong>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredVisitors.length)}</strong> of <strong>{filteredVisitors.length}</strong> visitors
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPage(1)} disabled={page === 1}
                        className="px-2 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      >«</button>
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                        className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      ><FiChevronLeft size={13} /></button>

                      {/* Page number buttons */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                        const p = start + i;
                        return (
                          <button key={p} onClick={() => setPage(p)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${p === page ? "bg-brand-primary text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
                            {p}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                        className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      ><FiChevronRight size={13} /></button>
                      <button
                        onClick={() => setPage(totalPages)} disabled={page === totalPages}
                        className="px-2 py-1.5 rounded-lg text-xs font-bold bg-white border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition-colors"
                      >»</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        </>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Visitor Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["🌍 Location",        `${selected.city || ""} ${selected.region || ""} ${selected.country || "Unknown"}`.trim()],
                ["📍 Coordinates",     selected.latitude ? `${selected.latitude}, ${selected.longitude}` : "N/A"],
                ["🕐 Timezone",        selected.timezone || "N/A"],
                ["🌐 ISP / Network",   selected.isp || "N/A"],
                ["📱 Device",          `${selected.device_type} — ${selected.screen_width}×${selected.screen_height}`],
                ["🖥 OS",              selected.os || "N/A"],
                ["🌐 Browser",         selected.browser || "N/A"],
                ["🔗 Referrer",        selected.referrer || "Direct"],
                ["🎯 UTM Source",      selected.utm_source || "None"],
                ["🎯 UTM Campaign",    selected.utm_campaign || "None"],
                ["🔍 Search Query",    selected.search_query || "None"],
                ["📄 Landing Page",    selected.landing_page || "/"],
                ["📚 Pages Visited",   (selected.pages_visited || []).join(" → ") || "/"],
                ["🛍 Products Viewed", (selected.products_viewed || []).length > 0 ? (selected.products_viewed || []).join(", ") : "None"],
                ["🏷 Categories",      (selected.categories_viewed || []).join(", ") || "None"],
                ["📜 Scroll Depth",    `${selected.max_scroll_depth || 0}%`],
                ["⏱ Time Spent",      fmt(selected.time_spent_seconds)],
                ["🕐 Visit Hour",      selected.hour_of_visit != null ? hourLabel(selected.hour_of_visit) : "N/A"],
                ["🔄 Returning?",      selected.is_returning ? "Yes — Returning Visitor" : "No — First Visit"],
                ["📅 First Visit",     new Date(selected.created_at).toLocaleString("en-IN")],
                ["👁 Last Seen",       new Date(selected.last_seen_at).toLocaleString("en-IN")],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-2 py-1 border-b border-gray-50">
                  <span className="text-gray-400 w-36 flex-shrink-0 text-xs">{label}</span>
                  <span className="text-gray-800 font-semibold text-xs flex-1 break-all">{val}</span>
                </div>
              ))}
            </div>
            {/* WhatsApp reach button in detail */}
            {selected.city && (
              <a href={waReach(selected.city)} target="_blank" rel="noopener noreferrer"
                className="mt-4 w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl transition-colors text-sm">
                <FaWhatsapp size={16} /> Promote to {selected.city} visitors
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
