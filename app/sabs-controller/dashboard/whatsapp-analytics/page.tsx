"use client";
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiRefreshCw, FiTrendingUp } from "react-icons/fi";

interface Click {
  id: string; product_name: string; product_brand: string; product_price: number;
  customer_name: string; customer_phone: string; source: string;
  page_url: string; created_at: string;
}

interface TopProduct { name: string; brand: string; price: number; clicks: number; }

export default function WhatsAppAnalytics() {
  const [clicks, setClicks]     = useState<Click[]>([]);
  const [top, setTop]           = useState<TopProduct[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [days, setDays]         = useState(30);

  const load = async (d: number) => {
    setLoading(true);
    const res = await fetch(`/api/admin/whatsapp-clicks?days=${d}`);
    const json = await res.json();
    setClicks(json.data || []);
    setTop(json.topProducts || []);
    setTotal(json.total || 0);
    setLoading(false);
  };

  useEffect(() => { load(days); }, [days]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaWhatsapp size={22} className="text-green-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">WhatsApp Click Analytics</h1>
            <p className="text-gray-500 text-sm mt-0.5">Track every Buy on WhatsApp button click</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[7,14,30,90].map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${days === d ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {d}d
            </button>
          ))}
          <button onClick={() => load(days)} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200">
            <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <FaWhatsapp size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{total}</p>
          <p className="text-sm text-gray-500 mt-1">Total Clicks ({days} days)</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <FiTrendingUp size={20} className="text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{top[0]?.clicks || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Top Product Clicks</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
            <span className="text-purple-600 font-bold text-sm">₹</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {clicks.filter((c) => c.customer_name).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Logged-in Customer Clicks</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">🔥 Top Clicked Products</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : top.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">No clicks tracked yet</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {top.map((p, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <span className={`w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center text-white ${i === 0 ? "bg-yellow-400" : i === 1 ? "bg-gray-400" : "bg-orange-400"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.brand} · ₹{p.price}</p>
                  </div>
                  <span className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-50 px-2.5 py-1 rounded-full">
                    <FaWhatsapp size={11} /> {p.clicks}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Clicks — enhanced with source + page + customer */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">🕐 Recent Clicks</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">Source page + customer info for every click</p>
          </div>
          {loading ? (
            <div className="h-20 animate-pulse bg-gray-50 m-4 rounded-xl" />
          ) : clicks.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">No clicks yet</p>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
              {clicks.slice(0, 50).map((c) => {
                let pagePath = c.page_url || "";
                try { pagePath = new URL(c.page_url).pathname; } catch {}
                return (
                  <div key={c.id} className="px-4 py-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0 space-y-0.5">
                        {/* Product */}
                        <p className="text-xs font-semibold text-gray-800 line-clamp-1">{c.product_name || "Unknown"}{c.product_price ? ` · ₹${c.product_price}` : ""}</p>
                        {/* Customer or guest */}
                        {c.customer_name ? (
                          <p className="text-[10px] font-bold text-brand-primary">
                            👤 {c.customer_name}
                            {c.customer_phone && (
                              <a href={`https://wa.me/91${c.customer_phone}`} target="_blank" rel="noopener noreferrer"
                                className="ml-1 text-green-600 hover:underline">· {c.customer_phone}</a>
                            )}
                          </p>
                        ) : (
                          <span className="text-[9px] bg-orange-100 text-orange-600 font-bold px-1.5 py-0.5 rounded-full">Guest — not logged in</span>
                        )}
                        {/* Source + page */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${SOURCE_LABEL_COLORS[c.source] || "bg-gray-100 text-gray-600"}`}>
                            {SOURCE_EMOJIS[c.source] || "📲"} {SOURCE_NAMES[c.source] || c.source || "unknown"}
                          </span>
                          {pagePath && <span className="text-[9px] text-gray-400 truncate max-w-[120px]">{pagePath}</span>}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Source label helpers (kept outside component for perf)
const SOURCE_NAMES: Record<string, string> = {
  "search_page":"Search Page","product_page":"Product Page","home_hero":"Home Hero",
  "category_page":"Category","trending_section":"Trending","bestseller_section":"Bestsellers",
  "search_no_results":"No Results","product_card":"Product Card","whatsapp_float":"Float Button",
};
const SOURCE_EMOJIS: Record<string, string> = {
  "search_page":"🔍","product_page":"🛍️","home_hero":"🏠","category_page":"📂",
  "trending_section":"🔥","bestseller_section":"⭐","search_no_results":"🤔",
  "product_card":"💳","whatsapp_float":"💬",
};
const SOURCE_LABEL_COLORS: Record<string, string> = {
  "search_page":"bg-blue-100 text-blue-700","product_page":"bg-purple-100 text-purple-700",
  "home_hero":"bg-pink-100 text-pink-700","category_page":"bg-orange-100 text-orange-700",
  "trending_section":"bg-red-100 text-red-700","bestseller_section":"bg-yellow-100 text-yellow-700",
  "search_no_results":"bg-gray-100 text-gray-600","product_card":"bg-teal-100 text-teal-700",
  "whatsapp_float":"bg-green-100 text-green-700",
};
