"use client";
import { useEffect, useState, useMemo } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiRefreshCw, FiTrendingUp, FiUser, FiAlertCircle, FiGlobe,
         FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiTruck,
         FiExternalLink, FiMapPin, FiPackage } from "react-icons/fi";

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
  // Shiprocket shipping state
  const [shipping, setShipping]   = useState<Record<string, "loading"|"done"|"error">>({});
  // Shiprocket order IDs saved after creation
  const [srOrders, setSrOrders]   = useState<Record<string, { shipment_id: string; order_id: string; awb?: string }>>({});
  // Courier details popup
  const [courierModal, setCourierModal] = useState<{
    clickId: string;
    customerName: string;
    customerPhone: string;
    productName: string;
  } | null>(null);
  const [courierDetails, setCourierDetails] = useState<Record<string, unknown> | null>(null);
  const [courierLoading, setCourierLoading] = useState(false);

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

  // ── Create Shiprocket order ───────────────────────────────────────────────
  const createShiprocketOrder = async (c: Click) => {
    setShipping(prev => ({ ...prev, [c.id]: "loading" }));
    try {
      const res = await fetch("/api/admin/shiprocket/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id:         `SABS-${c.id.slice(0,8).toUpperCase()}`,
          order_date:       new Date(c.created_at).toISOString().split("T")[0],
          customer_name:    c.customer_name,
          customer_phone:   c.customer_phone,
          delivery_address: "(From WhatsApp order — verify with customer)",
          delivery_city:    "Mumbai",
          delivery_state:   "Maharashtra",
          delivery_pincode: "400001",
          product_name:     c.product_name,
          product_price:    c.product_price,
          product_quantity: 1,
          weight:           0.3,
        }),
      });

      let data: { success?: boolean; error?: string; shipment_id?: string; shiprocket_order_id?: string; shiprocket_url?: string } = {};
      try { data = await res.json(); } catch { data = { error: `Server error ${res.status}` }; }

      if (data.success) {
        setShipping(prev => ({ ...prev, [c.id]: "done" }));
        setSrOrders(prev => ({
          ...prev,
          [c.id]: { shipment_id: data.shipment_id || "", order_id: data.shiprocket_order_id || "" },
        }));
        if (data.shiprocket_url) window.open(data.shiprocket_url, "_blank");
      } else {
        setShipping(prev => ({ ...prev, [c.id]: "error" }));
        alert(`Shiprocket error: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      setShipping(prev => ({ ...prev, [c.id]: "error" }));
      alert(`Network error: ${err instanceof Error ? err.message : "Unknown"}`);
    }
  };

  const openCourierDetails = async (c: Click) => {
    const sr = srOrders[c.id];
    setCourierModal({
      clickId: c.id,
      customerName: c.customer_name,
      customerPhone: c.customer_phone,
      productName: c.product_name,
    });
    setCourierDetails(null);
    setCourierLoading(true);
    try {
      const params = new URLSearchParams();
      if (sr?.shipment_id) params.set("shipment_id", sr.shipment_id);
      if (sr?.awb)         params.set("awb", sr.awb);
      if (sr?.order_id)    params.set("order_id", String(sr.order_id));
      const res = await fetch(`/api/admin/shiprocket/track?${params.toString()}`);
      const data = await res.json();
      if (data.success) setCourierDetails(data.details);
      else setCourierDetails({ error: data.error });
    } catch {
      setCourierDetails({ error: "Failed to fetch courier details" });
    }
    setCourierLoading(false);
  };

  const customerClicks = useMemo(() => clicks.filter(c => c.customer_name), [clicks]);
  const guestClicks    = useMemo(() => clicks.filter(c => !c.customer_name), [clicks]);

  // ── Delivery Rate Calculator ──────────────────────────────────────────────
  const [rateModal, setRateModal] = useState<{ c: Click } | null>(null);
  const [ratePincode, setRatePincode] = useState("");
  const [rateWeight, setRateWeight]   = useState("0.3");
  const [rateCOD, setRateCOD]         = useState(false);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateResult, setRateResult]   = useState<Record<string,unknown> | null>(null);

  const fetchRate = async () => {
    if (!ratePincode || ratePincode.length < 6) return;
    setRateLoading(true); setRateResult(null);
    try {
      const r = await fetch(`/api/admin/shiprocket/delivery-rate?pickup=400068&delivery=${ratePincode}&weight=${rateWeight}&cod=${rateCOD?1:0}&value=${rateModal?.c.product_price||500}`);
      const d = await r.json();
      setRateResult(d);
    } catch { setRateResult({ error: "Failed to fetch rates" }); }
    setRateLoading(false);
  };

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
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Ship</th>
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
                        <td className="px-4 py-2.5">
                          {c.customer_name ? (
                            shipping[c.id] === "done" ? (
                              <a href="https://app.shiprocket.in/seller/orders" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-lg hover:bg-green-200">
                                <FiExternalLink size={9}/> Done
                              </a>
                            ) : (
                              <button onClick={() => createShiprocketOrder(c)}
                                disabled={shipping[c.id]==="loading"}
                                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${
                                  shipping[c.id]==="loading" ? "bg-orange-100 text-orange-400 animate-pulse cursor-not-allowed"
                                  : shipping[c.id]==="error" ? "bg-red-100 text-red-600"
                                  : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
                                <FiTruck size={9}/>
                                {shipping[c.id]==="loading"?"...":shipping[c.id]==="error"?"Retry":"Ship"}
                              </button>
                            )
                          ) : (
                            <span className="text-[9px] text-gray-300">—</span>
                          )}
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
      {tab === "customers" && (        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Ship</th>
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
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            {/* WhatsApp Reminder */}
                            <a href={`https://wa.me/91${c.customer_phone}?text=${encodeURIComponent(`Hi ${c.customer_name}! 😊\n\nYou were interested in *${c.product_name || "a product"}* (₹${c.product_price || ""}) from Shree Ambika Beauty Shop.\n\nWould you like to place your order? I can arrange same-day delivery in Mumbai! 🚀\n\nReply YES and I'll confirm your order right away.\n\n- Vinod\nShree Ambika Beauty Shop\n+918291455297`)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[9px] font-bold px-2 py-1 rounded-lg transition-colors">
                              <FaWhatsapp size={9}/> Remind
                            </a>
                            {/* Delivery Rate */}
                            <button onClick={() => { setRateModal({c}); setRatePincode(""); setRateResult(null); }}
                              className="inline-flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-[9px] font-bold px-2 py-1 rounded-lg transition-colors">
                              <FiMapPin size={9}/> Rate
                            </button>
                            {/* Ship */}
                            {shipping[c.id] === "done" ? (
                              <div className="flex flex-col gap-0.5">
                                <a href="https://app.shiprocket.in/seller/orders" target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[9px] font-bold px-2 py-1 rounded-lg">
                                  <FiExternalLink size={8}/> Order ✓
                                </a>
                                <button onClick={() => openCourierDetails(c)}
                                  className="inline-flex items-center gap-1 bg-brand-primary hover:bg-brand-dark text-white text-[9px] font-bold px-2 py-1 rounded-lg transition-colors">
                                  <FiTruck size={8}/> Track
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => createShiprocketOrder(c)}
                                disabled={shipping[c.id] === "loading"}
                                className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg transition-colors ${
                                  shipping[c.id] === "error" ? "bg-red-100 text-red-600" :
                                  shipping[c.id] === "loading" ? "bg-orange-100 text-orange-400 animate-pulse cursor-not-allowed" :
                                  "bg-orange-500 hover:bg-orange-600 text-white"}`}>
                                <FiTruck size={8}/>
                                {shipping[c.id] === "loading" ? "..." : shipping[c.id] === "error" ? "Retry" : "Ship"}
                              </button>
                            )}
                          </div>
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

      {/* DELIVERY RATE MODAL */}
      {rateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setRateModal(null)}>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="bg-blue-600 px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white flex items-center gap-2"><FiPackage size={14}/> Delivery Rate Calculator</h3>
                <p className="text-blue-200 text-xs mt-0.5 line-clamp-1">{rateModal.c.product_name} — ₹{rateModal.c.product_price}</p>
              </div>
              <button onClick={() => setRateModal(null)} className="text-white/70 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 rounded-xl px-3 py-2 flex items-center gap-2">
                <FiMapPin size={12} className="text-green-600"/>
                <span className="text-xs font-semibold text-gray-700">Pickup: Dahisar East, Mumbai — 400068</span>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1 block">Customer Delivery Pincode *</label>
                <input type="text" maxLength={6} value={ratePincode}
                  onChange={e => setRatePincode(e.target.value.replace(/\D/g,""))}
                  placeholder="Enter 6-digit pincode"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500 font-mono tracking-widest" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 mb-1 block">Weight (kg)</label>
                  <input type="number" step="0.1" min="0.1" value={rateWeight}
                    onChange={e => setRateWeight(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <div className="flex flex-col justify-end pb-0.5">
                  <label className="text-xs font-bold text-gray-700 mb-2 block">Payment</label>
                  <div className="flex gap-2">
                    <button onClick={() => setRateCOD(false)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${!rateCOD?"bg-blue-600 text-white":"bg-gray-100 text-gray-600"}`}>
                      Prepaid
                    </button>
                    <button onClick={() => setRateCOD(true)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${rateCOD?"bg-orange-500 text-white":"bg-gray-100 text-gray-600"}`}>
                      COD
                    </button>
                  </div>
                </div>
              </div>
              <button onClick={fetchRate} disabled={ratePincode.length < 6 || rateLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-40">
                {rateLoading ? "Calculating..." : "Calculate Delivery Charge"}
              </button>
              {rateResult && (() => {
                const r = rateResult as { success?: boolean; error?: string; cheapest?: {name:string;total:number;days:number}; fastest?: {name:string;total:number;days:number}; couriers?: object[]; message?: string };
                if (r.error) return <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">⚠️ {r.error}</div>;
                if (r.message || !r.couriers?.length) return <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-xs text-orange-700">No courier available for this pincode.</div>;
                const cheapest = r.cheapest!; const fastest = r.fastest!;
                const waMsg = encodeURIComponent(`Hi ${rateModal.c.customer_name}!\n\nYour *${rateModal.c.product_name}* order delivery details:\n\nDelivery Charge: Rs.${cheapest.total}${rateCOD?" (COD)":" (Prepaid)"}\nCourier: ${cheapest.name}\nExpected Delivery: ${cheapest.days} working days\n\nTo confirm, reply with your full delivery address.\n\n- Vinod | Shree Ambika Beauty Shop | +918291455297`);
                return (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-green-600 font-bold">Cheapest</p>
                        <p className="text-xl font-black text-green-700">₹{cheapest.total}</p>
                        <p className="text-[10px] text-green-600">{cheapest.name}</p>
                        <p className="text-[10px] text-gray-500">{cheapest.days} days</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-blue-600 font-bold">Fastest</p>
                        <p className="text-xl font-black text-blue-700">₹{fastest.total}</p>
                        <p className="text-[10px] text-blue-600">{fastest.name}</p>
                        <p className="text-[10px] text-gray-500">{fastest.days} days</p>
                      </div>
                    </div>
                    <a href={`https://wa.me/91${rateModal.c.customer_phone}?text=${waMsg}`}
                      target="_blank" rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-sm transition-colors">
                      <FaWhatsapp size={14}/> Send Delivery Info to Customer
                    </a>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* COURIER DETAILS MODAL */}
      {courierModal && (
        <CourierModal
          modal={courierModal}
          details={courierDetails}
          loading={courierLoading}
          onClose={() => { setCourierModal(null); setCourierDetails(null); }}
        />
      )}

    </div>
  );
}

// ── COURIER DETAILS MODAL (appended) ─────────────────────────────────────────
// This component is rendered inside WhatsAppAnalytics via the courierModal state
// It is placed in a separate section to avoid duplicate function errors
function CourierModal({ modal, details, loading: courierLoading, onClose }: {
  modal: { clickId: string; customerName: string; customerPhone: string; productName: string };
  details: Record<string, unknown> | null;
  loading: boolean;
  onClose: () => void;
}) {
  const d = details as {
    awb_code?: string; courier_name?: string; status?: string;
    edd?: string; pickup_date?: string; tracking_url?: string;
    origin?: string; destination?: string; error?: string;
    activities?: { date: string; status: string; location: string }[];
  } | null;

  const waMsg = d && !d.error ? encodeURIComponent(
    `Hi ${modal.customerName}!\n\nYour order *${modal.productName}* has been shipped! 🚀\n\n` +
    `Courier: *${d.courier_name || "—"}*\n` +
    `AWB / Tracking No: *${d.awb_code || "—"}*\n` +
    (d.edd ? `Expected Delivery: *${d.edd}*\n` : "") +
    `Status: ${d.status || "In Transit"}\n\n` +
    (d.tracking_url ? `Track here: ${d.tracking_url}\n\n` : "") +
    `Thank you for shopping at Shree Ambika Beauty Shop!\n+918291455297`
  ) : "";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-brand-primary px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">🚚 Courier Details</h3>
            <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{modal.productName}</p>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl">✕</button>
        </div>
        <div className="p-5">
          {courierLoading ? (
            <div className="flex items-center justify-center py-8 gap-3">
              <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"/>
              <span className="text-xs text-gray-400">Fetching courier details...</span>
            </div>
          ) : d?.error ? (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-red-500">⚠️ {d.error}</p>
              <p className="text-xs text-gray-400">Go to Shiprocket → Orders to check manually</p>
              <a href="https://app.shiprocket.in/seller/orders" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-brand-primary text-white text-xs font-bold px-4 py-2 rounded-xl">
                Open Shiprocket →
              </a>
            </div>
          ) : d ? (
            <div className="space-y-3">
              {/* Courier info grid */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                {[
                  { label:"Courier Partner", value:d.courier_name, icon:"🚚" },
                  { label:"AWB / Tracking No", value:d.awb_code, icon:"📦", mono:true },
                  { label:"Current Status", value:d.status, icon:"📍" },
                  { label:"Expected Delivery", value:d.edd, icon:"📅" },
                  { label:"Pickup Date", value:d.pickup_date, icon:"🏭" },
                  { label:"From → To", value: d.origin && d.destination ? `${d.origin} → ${d.destination}` : null, icon:"🗺️" },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} className="flex items-start gap-2.5">
                    <span className="text-base flex-shrink-0">{row.icon}</span>
                    <div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wide font-semibold">{row.label}</p>
                      <p className={`text-xs font-bold text-gray-800 mt-0.5 ${row.mono ? "font-mono" : ""}`}>{String(row.value)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent tracking updates */}
              {d.activities && d.activities.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide mb-2">Recent Updates</p>
                  <div className="space-y-1.5">
                    {d.activities.slice(0,3).map((a,i) => (
                      <div key={i} className="flex items-start gap-2 bg-blue-50 rounded-xl p-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary mt-1.5 flex-shrink-0"/>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-800">{a.status}</p>
                          <p className="text-[9px] text-gray-500">{a.location} · {a.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                {d.tracking_url && (
                  <a href={d.tracking_url} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors">
                    Track Live →
                  </a>
                )}
                {waMsg && (
                  <a href={`https://wa.me/91${modal.customerPhone}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    Share with Customer
                  </a>
                )}
              </div>
              <p className="text-[9px] text-gray-400 text-center">Sends courier name, AWB No, EDD & tracking link</p>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-6 text-xs">No details available. Create shipment in Shiprocket first.</p>
          )}
        </div>
      </div>
    </div>
  );
}
