"use client";
import { useEffect, useState, useMemo } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiRefreshCw, FiTrendingUp, FiUser, FiAlertCircle, FiGlobe,
         FiChevronLeft, FiChevronRight, FiCalendar, FiClock } from "react-icons/fi";

interface Click {
  id: string; product_name: string; product_brand: string; product_price: number;
  customer_name: string; customer_phone: string; source: string;
  page_url: string; created_at: string;
}
interface TopProduct { name: string; brand: string; price: number; clicks: number; }

// ── helpers ──────────────────────────────────────────────────────────────────
const SOURCE_NAMES: Record<string,string> = {
  "search_page":"Search Page","product_page":"Product Page","home_hero":"Home Hero",
  "category_page":"Category","trending_section":"Trending","bestseller_section":"Bestsellers",
  "search_no_results":"No Results","product_card":"Product Card","whatsapp_float":"Float Button",
  "beauty_tips_page":"Beauty Tips","occasion_page":"Occasion","category_grid":"Category Grid",
};
const SOURCE_EMOJIS: Record<string,string> = {
  "search_page":"🔍","product_page":"🛍️","home_hero":"🏠","category_page":"📂",
  "trending_section":"🔥","bestseller_section":"⭐","search_no_results":"🤔",
  "product_card":"💳","whatsapp_float":"💬","beauty_tips_page":"💄","occasion_page":"🎉","category_grid":"📁",
};
const SOURCE_COLORS: Record<string,string> = {
  "search_page":"bg-blue-100 text-blue-700","product_page":"bg-purple-100 text-purple-700",
  "home_hero":"bg-pink-100 text-pink-700","category_page":"bg-orange-100 text-orange-700",
  "trending_section":"bg-red-100 text-red-700","bestseller_section":"bg-yellow-100 text-yellow-700",
  "search_no_results":"bg-gray-100 text-gray-600","product_card":"bg-teal-100 text-teal-700",
  "whatsapp_float":"bg-green-100 text-green-700","beauty_tips_page":"bg-rose-100 text-rose-700",
  "occasion_page":"bg-indigo-100 text-indigo-700","category_grid":"bg-amber-100 text-amber-700",
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:true });
}
function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)    return `${s}s ago`;
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}
function pagePath(url: string) {
  try { return new URL(url).pathname; } catch { return url || "—"; }
}

// ── Pagination Component ─────────────────────────────────────────────────────
function Pagination({ page, total, perPage, onChange }: {
  page: number; total: number; perPage: number; onChange: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  if (pages <= 1) return null;
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-100 flex-wrap gap-2">
      <p className="text-xs text-gray-500">
        Showing <strong>{(page-1)*perPage+1}–{Math.min(page*perPage, total)}</strong> of <strong>{total}</strong>
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onChange(1)} disabled={page===1}
          className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-[11px] font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30">«</button>
        <button onClick={() => onChange(page-1)} disabled={page===1}
          className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30">
          <FiChevronLeft size={12}/>
        </button>
        {Array.from({length: Math.min(5, pages)}, (_,i) => {
          const pg = start + i;
          return (
            <button key={pg} onClick={() => onChange(pg)}
              className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all ${pg===page?"bg-green-500 text-white":"bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"}`}>
              {pg}
            </button>
          );
        })}
        <button onClick={() => onChange(page+1)} disabled={page===pages}
          className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-30">
          <FiChevronRight size={12}/>
        </button>
        <button onClick={() => onChange(pages)} disabled={page===pages}
          className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-[11px] font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30">»</button>
      </div>
    </div>
  );
}

const PER_PAGE = 20;

export default function WhatsAppAnalytics() {
  const [clicks, setClicks] = useState<Click[]>([]);
  const [top, setTop]       = useState<TopProduct[]>([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [days, setDays]     = useState(30);
  const [tab, setTab]       = useState<"recent"|"sources"|"customers">("recent");
  // Pagination state per tab
  const [pRecent, setPRecent]     = useState(1);
  const [pSources, setPSources]   = useState(1);
  const [pCustomers, setPCustomers] = useState(1);

  const load = async (d: number) => {
    setLoading(true);
    const res = await fetch(`/api/admin/whatsapp-clicks?days=${d}`);
    const json = await res.json();
    setClicks(json.data || []);
    setTop(json.topProducts || []);
    setTotal(json.total || 0);
    setLoading(false);
    setPRecent(1); setPSources(1); setPCustomers(1);
  };

  useEffect(() => { load(days); }, [days]);

  const customerClicks = useMemo(() => clicks.filter(c => c.customer_name), [clicks]);
  const guestClicks    = useMemo(() => clicks.filter(c => !c.customer_name), [clicks]);

  const sourceBreakdown = useMemo(() => {
    const acc: Record<string,number> = {};
    clicks.forEach(c => { acc[c.source||"unknown"] = (acc[c.source||"unknown"]||0)+1; });
    return Object.entries(acc).sort((a,b)=>b[1]-a[1]);
  }, [clicks]);

  // Paginated slices
  const recentPage    = clicks.slice((pRecent-1)*PER_PAGE, pRecent*PER_PAGE);
  const customersPage = customerClicks.slice((pCustomers-1)*PER_PAGE, pCustomers*PER_PAGE);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FaWhatsapp size={22} className="text-green-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">WhatsApp Analytics</h1>
            <p className="text-gray-500 text-sm mt-0.5">Every order click — exact time, source page, customer</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {[7,14,30,90].map(d => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${days===d?"bg-green-500 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {d}d
            </button>
          ))}
          <button onClick={() => load(days)} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200">
            <FiRefreshCw size={14} className={loading?"animate-spin":""} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon:<FaWhatsapp size={18} className="text-green-600"/>, bg:"bg-green-100", val:total, label:`Total Clicks (${days}d)` },
          { icon:<FiUser size={18} className="text-blue-600"/>, bg:"bg-blue-100", val:customerClicks.length, label:"Logged-in Customers" },
          { icon:<FiAlertCircle size={18} className="text-orange-500"/>, bg:"bg-orange-100", val:guestClicks.length, label:"Guest Clicks" },
          { icon:<FiTrendingUp size={18} className="text-purple-600"/>, bg:"bg-purple-100", val:top[0]?.clicks||0, label:"Top Product Clicks" },
        ].map((s,i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.val}</p>
              <p className="text-[11px] text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Guest alert */}
      {guestClicks.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <FiAlertCircle size={18} className="text-orange-500 flex-shrink-0 mt-0.5"/>
          <div>
            <p className="text-sm font-bold text-orange-800">{guestClicks.length} click{guestClicks.length>1?"s":""} from guests — no customer info captured</p>
            <p className="text-xs text-orange-600 mt-0.5">Login modal now prompts before WhatsApp opens. Future orders will capture name + address.</p>
          </div>
        </div>
      )}

      {/* Top Products */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-5">
        <div className="px-5 py-4 border-b border-gray-100"><h2 className="font-bold text-gray-800">🔥 Most Ordered Products</h2></div>
        {loading ? <div className="h-16 animate-pulse bg-gray-50 m-4 rounded-xl"/> : top.length===0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No clicks yet</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {top.map((p,i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <span className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center text-white flex-shrink-0 ${i===0?"bg-yellow-400":i===1?"bg-gray-400":"bg-orange-400"}`}>{i+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.brand} · ₹{p.price}</p>
                </div>
                <span className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                  <FaWhatsapp size={11}/> {p.clicks}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {([
          {key:"recent",    label:"🕐 All Clicks"},
          {key:"sources",   label:"📍 By Source"},
          {key:"customers", label:"👤 Customers"},
        ] as const).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${tab===t.key?"bg-green-500 text-white":"bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── RECENT CLICKS TAB ─────────────────────────────────────────────── */}
      {tab === "recent" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? <div className="h-32 animate-pulse bg-gray-50 m-4 rounded-xl"/> :
           clicks.length === 0 ? <p className="text-center text-gray-400 py-10 text-sm">No clicks yet</p> : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Source</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Page</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPage.map(c => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-2.5">
                          <p className="text-xs font-semibold text-gray-800 line-clamp-1 max-w-[130px]">{c.product_name||"—"}</p>
                          {c.product_price && <p className="text-[10px] text-gray-400">₹{c.product_price}</p>}
                        </td>
                        <td className="px-4 py-2.5">
                          {c.customer_name ? (
                            <div>
                              <p className="text-xs font-bold text-brand-primary">{c.customer_name}</p>
                              {c.customer_phone && (
                                <a href={`https://wa.me/91${c.customer_phone}`} target="_blank" rel="noopener noreferrer"
                                  className="text-[10px] text-green-600 hover:underline">{c.customer_phone}</a>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-1.5 py-0.5 rounded-full">Guest</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SOURCE_COLORS[c.source]||"bg-gray-100 text-gray-600"}`}>
                            {SOURCE_EMOJIS[c.source]||"📲"} {SOURCE_NAMES[c.source]||c.source||"—"}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-[10px] text-gray-500 truncate max-w-[90px]">{pagePath(c.page_url)}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-1">
                            <FiCalendar size={9} className="text-gray-400"/>
                            <span className="text-[10px] font-semibold text-gray-700">{fmtDate(c.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiClock size={9} className="text-green-500"/>
                            <span className="text-[10px] font-bold text-green-600">{fmtTime(c.created_at)}</span>
                          </div>
                          <span className="text-[9px] text-gray-400">{timeAgo(c.created_at)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={pRecent} total={clicks.length} perPage={PER_PAGE} onChange={setPRecent}/>
            </>
          )}
        </div>
      )}

      {/* ── SOURCES TAB ───────────────────────────────────────────────────── */}
      {tab === "sources" && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FiGlobe size={15}/> Click Source Breakdown</h3>
            {sourceBreakdown.length===0 ? <p className="text-xs text-gray-400">No data</p> : (
              <div className="space-y-2.5">
                {sourceBreakdown.map(([src,count]) => {
                  const max = sourceBreakdown[0]?.[1]||1;
                  return (
                    <div key={src}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${SOURCE_COLORS[src]||"bg-gray-100 text-gray-600"}`}>
                            {SOURCE_EMOJIS[src]||"📲"} {SOURCE_NAMES[src]||src}
                          </span>
                        </span>
                        <span className="font-bold text-gray-800">{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{width:`${(count/max)*100}%`}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-800 mb-4">📄 Top Pages with Orders</h3>
            {clicks.length===0 ? <p className="text-xs text-gray-400">No data</p> : (() => {
              const pages: Record<string,number> = {};
              clicks.forEach(c => { if(c.page_url){ const p=pagePath(c.page_url); pages[p]=(pages[p]||0)+1; }});
              const sorted = Object.entries(pages).sort((a,b)=>b[1]-a[1]).slice(0,10);
              const max = sorted[0]?.[1]||1;
              return (
                <div className="space-y-2.5">
                  {sorted.map(([pg,cnt]) => (
                    <div key={pg}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-gray-700 truncate max-w-[180px]">{pg}</span>
                        <span className="font-bold text-gray-800 ml-2 flex-shrink-0">{cnt}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-primary rounded-full" style={{width:`${(cnt/max)*100}%`}}/>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ── CUSTOMERS TAB ─────────────────────────────────────────────────── */}
      {tab === "customers" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? <div className="h-32 animate-pulse bg-gray-50 m-4 rounded-xl"/> :
           customerClicks.length===0 ? (
            <div className="text-center py-12 text-gray-400">
              <FiUser size={36} className="mx-auto mb-3 opacity-30"/>
              <p className="text-sm">No logged-in customer clicks yet.</p>
            </div>
           ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-xs">
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Source</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersPage.map(c => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold text-gray-800">{c.customer_name}</p>
                          {c.customer_phone && (
                            <a href={`https://wa.me/91${c.customer_phone}`} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-green-600 hover:underline flex items-center gap-1">
                              <FaWhatsapp size={10}/> {c.customer_phone}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-gray-800 line-clamp-1 max-w-[140px]">{c.product_name||"—"}</p>
                          {c.product_price && <p className="text-[10px] text-gray-400">₹{c.product_price}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SOURCE_COLORS[c.source]||"bg-gray-100 text-gray-600"}`}>
                            {SOURCE_EMOJIS[c.source]||"📲"} {SOURCE_NAMES[c.source]||c.source||"—"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <FiCalendar size={9} className="text-gray-400"/>
                            <span className="text-[10px] font-semibold text-gray-700">{fmtDate(c.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FiClock size={9} className="text-green-500"/>
                            <span className="text-[10px] font-bold text-green-600">{fmtTime(c.created_at)}</span>
                          </div>
                          <span className="text-[9px] text-gray-400">{timeAgo(c.created_at)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={pCustomers} total={customerClicks.length} perPage={PER_PAGE} onChange={setPCustomers}/>
            </>
           )}
        </div>
      )}
    </div>
  );
}
