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

        {/* Recent Clicks */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">🕐 Recent Clicks</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : clicks.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">No clicks yet</p>
          ) : (
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto">
              {clicks.slice(0, 50).map((c) => (
                <div key={c.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">{c.product_name || "Unknown Product"}</p>
                      {c.customer_name && (
                        <p className="text-xs text-brand-primary font-semibold">👤 {c.customer_name} · {c.customer_phone}</p>
                      )}
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <span className="capitalize">{c.source?.replace("_", " ")}</span>
                        {c.product_price && <span>· ₹{c.product_price}</span>}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(c.created_at).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
