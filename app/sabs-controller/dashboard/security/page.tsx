"use client";
import { useEffect, useState } from "react";
import { FiShield, FiAlertTriangle, FiCheckCircle, FiRefreshCw, FiXCircle } from "react-icons/fi";
import { MdDevices } from "react-icons/md";

interface Attempt {
  id: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  attempted_at: string;
}

interface Stats {
  totalAttempts: number;
  successCount: number;
  failCount: number;
}

interface SuspiciousIP {
  ip: string;
  count: number;
  lastSeen: string;
  userAgent: string;
}

interface MyIP {
  ip: string;
  count: number;
  lastSeen: string;
}

function parseDevice(ua: string): string {
  if (!ua || ua === "unknown") return "Unknown Device";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad/i.test(ua)) return "iPhone/iPad";
  if (/windows/i.test(ua)) return "Windows PC";
  if (/macintosh|mac os/i.test(ua)) return "Mac";
  if (/linux/i.test(ua)) return "Linux";
  return "Unknown Device";
}

function parseBrowser(ua: string): string {
  if (!ua || ua === "unknown") return "Unknown";
  if (ua.includes("Chrome") && !ua.includes("Edg")) return "Chrome";
  if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  return "Other";
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function SecurityPage() {
  const [attempts, setAttempts]       = useState<Attempt[]>([]);
  const [stats, setStats]             = useState<Stats | null>(null);
  const [suspicious, setSuspicious]   = useState<SuspiciousIP[]>([]);
  const [myIPs, setMyIPs]             = useState<MyIP[]>([]);
  const [loading, setLoading]         = useState(true);
  const [tab, setTab]                 = useState<"log" | "suspicious" | "mylogins">("log");

  const load = async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/admin/login-attempts");
      const json = await res.json();
      setAttempts(json.attempts      || []);
      setStats(json.stats            || null);
      setSuspicious(json.suspiciousList || []);
      setMyIPs(json.myIPList         || []);
    } catch {
      // ignore
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FiShield size={22} className="text-brand-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Admin Security</h1>
            <p className="text-gray-500 text-sm mt-0.5">Every login attempt — IP, device, time, success or fail</p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors"
        >
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FiShield size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalAttempts}</p>
              <p className="text-xs text-gray-500">Total Attempts</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <FiCheckCircle size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-700">{stats.successCount}</p>
              <p className="text-xs text-gray-500">Successful Logins</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stats.failCount > 5 ? "bg-red-50" : "bg-orange-50"}`}>
              <FiAlertTriangle size={18} className={stats.failCount > 5 ? "text-red-600" : "text-orange-500"} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${stats.failCount > 5 ? "text-red-600" : "text-orange-600"}`}>{stats.failCount}</p>
              <p className="text-xs text-gray-500">Failed Attempts</p>
              {stats.failCount > 5 && (
                <p className="text-[10px] text-red-500 font-bold mt-0.5">⚠ Multiple failures!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alert banner if suspicious activity */}
      {suspicious.some((s) => s.count >= 3) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
          <FiAlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-800">Suspicious Activity Detected!</p>
            <p className="text-xs text-red-600 mt-0.5">
              {suspicious.filter((s) => s.count >= 3).length} IP{suspicious.filter((s) => s.count >= 3).length > 1 ? "s have" : " has"} failed 3+ times.
              Check the &quot;Suspicious IPs&quot; tab immediately.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-5 border-b border-gray-100 pb-3 flex-wrap">
        {([
          { key: "log",        label: "📋 Full Login Log" },
          { key: "suspicious", label: "🚨 Suspicious IPs" },
          { key: "mylogins",   label: "✅ My Login IPs" },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === t.key ? "bg-brand-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t.label}
            {t.key === "suspicious" && suspicious.length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                {suspicious.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── FULL LOG TAB ── */}
          {tab === "log" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {attempts.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <FiShield size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No login attempts recorded yet.</p>
                  <p className="text-xs mt-1">Attempts will appear here after the first login try.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs">
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">IP Address</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Device / Browser</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Time</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map((a) => (
                        <tr key={a.id} className={`border-b border-gray-50 transition-colors ${a.success ? "hover:bg-green-50/30" : "hover:bg-red-50/30"}`}>
                          <td className="px-5 py-3">
                            {a.success ? (
                              <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                <FiCheckCircle size={10} /> SUCCESS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-[10px] font-bold px-2.5 py-1 rounded-full">
                                <FiXCircle size={10} /> FAILED
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <span className="font-mono text-xs font-semibold text-gray-700">{a.ip_address}</span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-1.5">
                              <MdDevices size={13} className="text-gray-400" />
                              <div>
                                <p className="text-xs font-semibold text-gray-700">{parseDevice(a.user_agent)}</p>
                                <p className="text-[10px] text-gray-400">{parseBrowser(a.user_agent)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-600 font-mono">
                            {new Date(a.attempted_at).toLocaleString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit", second: "2-digit",
                              hour12: true,
                            })}
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-400">{timeAgo(a.attempted_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── SUSPICIOUS IPs TAB ── */}
          {tab === "suspicious" && (
            <div className="space-y-4">
              {suspicious.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                  <FiCheckCircle size={36} className="mx-auto text-green-500 mb-3" />
                  <p className="text-sm font-bold text-green-800">No suspicious activity!</p>
                  <p className="text-xs text-green-600 mt-1">No IPs with failed login attempts found.</p>
                </div>
              ) : (
                suspicious.map((s) => (
                  <div
                    key={s.ip}
                    className={`bg-white rounded-2xl p-5 border shadow-sm ${s.count >= 5 ? "border-red-300" : s.count >= 3 ? "border-orange-200" : "border-gray-100"}`}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.count >= 5 ? "bg-red-100" : "bg-orange-50"}`}>
                          <FiAlertTriangle size={18} className={s.count >= 5 ? "text-red-600" : "text-orange-500"} />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-gray-800 text-sm">{s.ip}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">Last attempt: {timeAgo(s.lastSeen)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${s.count >= 5 ? "text-red-600" : "text-orange-600"}`}>
                          {s.count}
                        </span>
                        <p className="text-[10px] text-gray-400">failed attempt{s.count > 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1.5">
                        <MdDevices size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500">{parseDevice(s.userAgent)} — {parseBrowser(s.userAgent)}</span>
                      </div>
                      {s.count >= 3 && (
                        <div className={`mt-2 text-xs font-semibold px-3 py-1.5 rounded-xl inline-block ${s.count >= 5 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"}`}>
                          {s.count >= 5 ? "🚨 Possible brute-force attack! Change your PIN immediately." : "⚠ Multiple failed attempts from this IP."}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── MY LOGIN IPs TAB ── */}
          {tab === "mylogins" && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-4">
                <p className="text-sm font-bold text-blue-800">Your Successful Login Locations</p>
                <p className="text-xs text-blue-600 mt-1">
                  These are IPs where admin login was successful — home, office, mobile hotspot etc.
                  If you see an unfamiliar IP here, your PIN may be compromised. Change it immediately!
                </p>
              </div>

              {myIPs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-sm">No successful logins recorded yet.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-xs">
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">#</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">IP Address</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Times Logged In</th>
                        <th className="text-left px-5 py-3 font-semibold text-gray-600">Last Login</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myIPs.map((ip, i) => (
                        <tr key={ip.ip} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-5 py-3 text-xs text-gray-400">#{i + 1}</td>
                          <td className="px-5 py-3">
                            <span className="font-mono text-xs font-bold text-gray-800">{ip.ip}</span>
                            {i === 0 && (
                              <span className="ml-2 text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full">
                                Most Used
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <span className="text-sm font-bold text-brand-primary">{ip.count}</span>
                            <span className="text-xs text-gray-400 ml-1">times</span>
                          </td>
                          <td className="px-5 py-3">
                            <p className="text-xs text-gray-600">
                              {new Date(ip.lastSeen).toLocaleString("en-IN", {
                                day: "2-digit", month: "short", year: "numeric",
                                hour: "2-digit", minute: "2-digit", hour12: true,
                              })}
                            </p>
                            <p className="text-[10px] text-gray-400">{timeAgo(ip.lastSeen)}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
