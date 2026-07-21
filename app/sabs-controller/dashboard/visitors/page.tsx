"use client";
import { useEffect, useState } from "react";
import { FiUsers, FiGlobe, FiSmartphone, FiMonitor, FiRefreshCw, FiClock } from "react-icons/fi";
import { MdRepeat } from "react-icons/md";

interface Visitor {
  id: string; session_id: string; ip_address: string;
  country: string; country_code: string; region: string; city: string;
  latitude: number; longitude: number; timezone: string; isp: string;
  device_type: string; os: string; browser: string;
  screen_width: number; screen_height: number;
  referrer: string; utm_source: string; utm_medium: string; utm_campaign: string;
  landing_page: string; pages_visited: string[];
  time_spent_seconds: number; is_returning: boolean;
  created_at: string; last_seen_at: string;
}

interface Stats {
  total: number; returning: number; mobile: number; desktop: number;
  tablet: number; countries: number; avgTimeSeconds: number;
}

const DAYS_OPTIONS = [7, 14, 30, 90];

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [days, setDays]         = useState(30);
  const [selected, setSelected] = useState<Visitor | null>(null);

  const load = async (d: number) => {
    setLoading(true);
    const res = await fetch(`/api/admin/visitors?days=${d}`);
    const json = await res.json();
    setVisitors(json.data || []);
    setStats(json.stats || null);
    setLoading(false);
  };

  useEffect(() => { load(days); }, [days]);

  const formatTime = (secs: number) => {
    if (!secs) return "< 1s";
    if (secs < 60) return `${secs}s`;
    return `${Math.floor(secs / 60)}m ${secs % 60}s`;
  };

  const flag = (code: string) => {
    if (!code || code.length < 2) return "🌍";
    const c1 = 0x1f1e6 + code.toUpperCase().charCodeAt(0) - 65;
    const c2 = 0x1f1e6 + code.toUpperCase().charCodeAt(1) - 65;
    return String.fromCodePoint(c1, c2);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FiUsers size={22} className="text-brand-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Customer Visits</h1>
            <p className="text-gray-500 text-sm mt-0.5">Track every visitor — device, location, time spent</p>
          </div>
        </div>
        <div className="flex gap-2">
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

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-6">
          {[
            { icon: <FiUsers size={18} />, label: "Total Visitors", val: stats.total, color: "text-blue-600 bg-blue-50" },
            { icon: <MdRepeat size={18} />, label: "Returning", val: stats.returning, color: "text-purple-600 bg-purple-50" },
            { icon: <FiSmartphone size={18} />, label: "Mobile", val: stats.mobile, color: "text-green-600 bg-green-50" },
            { icon: <FiMonitor size={18} />, label: "Desktop", val: stats.desktop, color: "text-orange-600 bg-orange-50" },
            { icon: <span className="text-base">📱</span>, label: "Tablet", val: stats.tablet, color: "text-pink-600 bg-pink-50" },
            { icon: <FiGlobe size={18} />, label: "Countries", val: stats.countries, color: "text-teal-600 bg-teal-50" },
            { icon: <FiClock size={18} />, label: "Avg Time", val: formatTime(stats.avgTimeSeconds), color: "text-brand-primary bg-brand-light" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-2`}>{s.icon}</div>
              <p className="text-xl font-bold text-gray-800">{s.val}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : visitors.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FiUsers size={40} className="mx-auto mb-3 opacity-30" />
            <p>No visitor data yet. Visitors will appear here as people browse the site.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Location</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Device</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Source</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Landing</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Pages</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Time</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
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
                        {v.device_type === "mobile" ? <FiSmartphone size={12} className="text-green-500" /> :
                         v.device_type === "desktop" ? <FiMonitor size={12} className="text-blue-500" /> :
                         <span className="text-xs">📱</span>}
                        <span className="text-xs text-gray-600 capitalize">{v.device_type}</span>
                      </div>
                      <p className="text-[10px] text-gray-400">{v.browser} / {v.os}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      {v.utm_source ? (
                        <span className="text-xs bg-orange-50 text-orange-600 font-semibold px-2 py-0.5 rounded-full">{v.utm_source}</span>
                      ) : v.referrer ? (
                        <span className="text-xs text-gray-500 truncate max-w-[100px] block">{v.referrer.replace("https://","").slice(0,20)}</span>
                      ) : (
                        <span className="text-xs text-gray-300">Direct</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-gray-600 truncate max-w-[100px] block">{v.landing_page || "/"}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-bold text-gray-800">{v.pages_visited?.length || 1}</span>
                      <span className="text-[10px] text-gray-400 ml-1">pages</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold text-gray-700">{formatTime(v.time_spent_seconds)}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      {v.is_returning ? (
                        <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-full">Return</span>
                      ) : (
                        <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">New</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[10px] text-gray-400">
                      {new Date(v.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">Visitor Details</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["🌍 Location", `${selected.city || ""} ${selected.region || ""} ${selected.country || "Unknown"}`],
                ["📍 Coordinates", selected.latitude ? `${selected.latitude}, ${selected.longitude}` : "N/A"],
                ["🕐 Timezone", selected.timezone || "N/A"],
                ["🌐 ISP / Org", selected.isp || "N/A"],
                ["📱 Device", `${selected.device_type} — ${selected.screen_width}×${selected.screen_height}`],
                ["🖥 OS", selected.os || "N/A"],
                ["🌐 Browser", selected.browser || "N/A"],
                ["🔗 Referrer", selected.referrer || "Direct"],
                ["🎯 UTM Source", selected.utm_source || "None"],
                ["🎯 UTM Campaign", selected.utm_campaign || "None"],
                ["📄 Landing Page", selected.landing_page || "/"],
                ["📚 Pages Visited", (selected.pages_visited || []).join(", ") || "/"],
                ["⏱ Time Spent", formatTime(selected.time_spent_seconds)],
                ["🔄 Returning?", selected.is_returning ? "Yes" : "No — First Visit"],
                ["📅 First Visit", new Date(selected.created_at).toLocaleString("en-IN")],
                ["👁 Last Seen", new Date(selected.last_seen_at).toLocaleString("en-IN")],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-gray-500 w-40 flex-shrink-0 text-xs">{label}</span>
                  <span className="text-gray-800 font-semibold text-xs flex-1 break-all">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
