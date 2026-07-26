"use client";
import { useEffect, useState } from "react";
import { FiUsers, FiSearch, FiPhone, FiMapPin, FiMail, FiClock, FiCalendar, FiRefreshCw } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

interface Customer {
  id: string; full_name: string; phone: string; email?: string;
  address: string; city?: string; state?: string; pincode?: string;
  created_at: string; updated_at: string;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }),
    day:  d.toLocaleDateString("en-IN", { weekday: "long" }),
    full: d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }),
  };
}

function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Customer | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then(({ data }) => { setCustomers(data || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const filtered = customers.filter((c) =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const waMsg = (c: Customer) => encodeURIComponent(
    `Hi ${c.full_name}! This is Vinod from Shree Ambika Beauty Shop. `
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FiUsers size={22} className="text-brand-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Registered Customers</h1>
            <p className="text-gray-500 text-sm mt-0.5">Every customer who logged in — exact time, full details</p>
          </div>
        </div>
        <button onClick={load} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-3xl font-bold text-brand-primary">{customers.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Registered</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-3xl font-bold text-blue-600">{customers.filter(c => c.city).length}</p>
          <p className="text-sm text-gray-500 mt-1">With City Info</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-3xl font-bold text-green-600">
            {customers.filter(c => (Date.now() - new Date(c.created_at).getTime()) < 7*86400*1000).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">This Week</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 mb-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
          <FiSearch className="text-gray-400" size={14} />
          <input type="text" placeholder="Search by name, phone, city..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700 w-full" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FiUsers size={40} className="mx-auto mb-3 opacity-30" />
            <p>No customers yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Phone</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Address</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Registered On</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const dt = formatDateTime(c.created_at);
                  return (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelected(c)}>
                      <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">{c.full_name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{c.full_name}</p>
                            {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800">+91{c.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-600 line-clamp-1 max-w-[160px]">{c.address}</p>
                        <p className="text-xs text-gray-400">{[c.city, c.state, c.pincode].filter(Boolean).join(", ")}</p>
                      </td>
                      <td className="px-4 py-3">
                        {/* Exact date + time */}
                        <div className="flex items-center gap-1 mb-0.5">
                          <FiCalendar size={10} className="text-gray-400" />
                          <span className="text-xs font-semibold text-gray-700">{dt.date}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-0.5">
                          <FiClock size={10} className="text-brand-primary" />
                          <span className="text-xs font-bold text-brand-primary">{dt.time}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{timeAgo(c.created_at)}</span>
                      </td>
                      <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                        <a href={`https://wa.me/91${c.phone}?text=${waMsg(c)}`}
                          target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors">
                          <FaWhatsapp size={12} /> Message
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-500">
              {filtered.length} of {customers.length} customers
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal — full data */}
      {selected && (() => {
        const dt = formatDateTime(selected.created_at);
        const dtUpdated = formatDateTime(selected.updated_at);
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelected(null)}>
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="bg-brand-primary px-6 py-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-xl">{selected.full_name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-lg leading-tight">{selected.full_name}</p>
                  <p className="text-white/70 text-xs">+91 {selected.phone}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white text-xl leading-none">✕</button>
              </div>

              <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">

                {/* Registration time — highlighted */}
                <div className="bg-brand-light rounded-2xl p-4 border border-brand-primary/20">
                  <p className="text-[10px] font-black text-brand-primary uppercase tracking-wide mb-2">📅 Registration Details</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Day</span>
                      <span className="text-xs font-bold text-gray-800">{dt.day}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Date</span>
                      <span className="text-xs font-bold text-gray-800">{dt.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Exact Time</span>
                      <span className="text-xs font-bold text-brand-primary">{dt.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">How long ago</span>
                      <span className="text-xs font-semibold text-gray-600">{timeAgo(selected.created_at)}</span>
                    </div>
                    {selected.updated_at !== selected.created_at && (
                      <div className="flex justify-between pt-1 border-t border-brand-primary/10">
                        <span className="text-xs text-gray-400">Last Updated</span>
                        <span className="text-[10px] text-gray-400">{dtUpdated.date} {dtUpdated.time}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Contact Info</p>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                    <FiPhone size={14} className="text-brand-primary flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-gray-400">Phone / WhatsApp</p>
                      <p className="font-bold text-gray-800 text-sm">+91 {selected.phone}</p>
                    </div>
                  </div>
                  {selected.email && (
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <FiMail size={14} className="text-brand-primary flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400">Email</p>
                        <p className="font-bold text-gray-800 text-sm">{selected.email}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wide">Delivery Address</p>
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3">
                    <FiMapPin size={14} className="text-brand-primary flex-shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-gray-800 text-sm leading-relaxed">{selected.address}</p>
                      {selected.city && <p className="text-xs text-gray-500">City: <strong>{selected.city}</strong></p>}
                      {selected.state && <p className="text-xs text-gray-500">State: <strong>{selected.state}</strong></p>}
                      {selected.pincode && <p className="text-xs text-gray-500">Pincode: <strong>{selected.pincode}</strong></p>}
                    </div>
                  </div>
                </div>

                {/* System ID */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 mb-1">Customer ID</p>
                  <p className="font-mono text-[10px] text-gray-500 break-all">{selected.id}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="px-5 pb-5 flex gap-2">
                <a href={`https://wa.me/91${selected.phone}?text=${waMsg(selected)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl transition-colors text-sm">
                  <FaWhatsapp size={16} /> WhatsApp
                </a>
                {selected.email && (
                  <a href={`mailto:${selected.email}`}
                    className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-2xl transition-colors text-sm">
                    <FiMail size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

