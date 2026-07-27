"use client";
import { useEffect, useState } from "react";
import { FiUsers, FiSearch, FiPhone, FiMapPin, FiMail, FiClock, FiCalendar, FiRefreshCw, FiGift, FiCheck } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { createClient } from "@supabase/supabase-js";

interface Customer {
  id: string; full_name: string; phone: string; email?: string;
  address: string; city?: string; state?: string; pincode?: string;
  created_at: string; updated_at: string;
}

interface PopupLead {
  id: string; name: string; phone: string; source: string;
  page: string; beauty_tip: string; contacted: boolean; created_at: string;
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
  const [tab,       setTab]       = useState<"customers" | "leads">("customers");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads,     setLeads]     = useState<PopupLead[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [selected,  setSelected]  = useState<Customer | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then(({ data }) => {
        setCustomers(data || []);
        // Also load popup leads
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        supabase.from("popup_leads").select("*").order("created_at", { ascending: false })
          .then(({ data: ld }) => { setLeads(ld || []); setLoading(false); });
      });
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
            <h1 className="text-2xl font-bold text-gray-800">Customers & Leads</h1>
            <p className="text-gray-500 text-sm mt-0.5">Registered customers + popup leads from website</p>
          </div>
        </div>
        <button onClick={load} className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
          <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("customers")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "customers" ? "bg-brand-primary text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-brand-primary"}`}>
          <FiUsers size={14} /> Registered ({customers.length})
        </button>
        <button onClick={() => setTab("leads")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === "leads" ? "bg-orange-500 text-white shadow" : "bg-white text-gray-600 border border-gray-200 hover:border-orange-400"}`}>
          <FiGift size={14} /> Popup Leads
          {leads.filter(l => !l.contacted).length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {leads.filter(l => !l.contacted).length} new
            </span>
          )}
        </button>
      </div>

      {/* ── POPUP LEADS TAB ─────────────────────────────── */}
      {tab === "leads" && (
        <div>
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
            <FiGift size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-orange-800 text-sm">These people gave their contact on your website!</p>
              <p className="text-orange-700 text-xs mt-0.5">WhatsApp them personally — they are warm leads, already interested in your products.</p>
            </div>
          </div>

          {leads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              <FiGift size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No popup leads yet</p>
              <p className="text-xs mt-1">Leads will appear here when visitors submit the engagement popup</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((lead, i) => (
                <div key={lead.id} className={`bg-white rounded-2xl border p-4 flex items-start gap-4 ${!lead.contacted ? "border-orange-200 shadow-sm" : "border-gray-100 opacity-70"}`}>
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 text-white font-black text-base">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 text-sm">{lead.name}</p>
                      {!lead.contacted && <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">New Lead</span>}
                      {lead.contacted && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><FiCheck size={8} /> Contacted</span>}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">+91 {lead.phone}</p>
                    {lead.beauty_tip && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">💡 Tip shown: {lead.beauty_tip.slice(0, 60)}...</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(lead.created_at)} · {lead.page}</p>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <a href={`https://wa.me/91${lead.phone}?text=${encodeURIComponent(`Hi ${lead.name}! This is Vinod from Shree Ambika Beauty Shop Mumbai. You visited our website and I wanted to personally help you with your beauty needs! 😊 What products are you looking for?`)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors">
                      <FaWhatsapp size={12} /> WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CUSTOMERS TAB ────────────────────────────────── */}
      {tab === "customers" && (
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
      )} {/* end customers tab */}

    </div> // end main div
  );
}

