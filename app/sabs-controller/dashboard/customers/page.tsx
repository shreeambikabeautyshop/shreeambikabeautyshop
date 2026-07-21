"use client";
import { useEffect, useState } from "react";
import { FiUsers, FiSearch, FiPhone, FiMapPin, FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

interface Customer {
  id: string; full_name: string; phone: string; email?: string;
  address: string; city?: string; state?: string; pincode?: string;
  created_at: string; updated_at: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [selected, setSelected]   = useState<Customer | null>(null);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then(({ data }) => { setCustomers(data || []); setLoading(false); });
  }, []);

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
      <div className="flex items-center gap-3 mb-6">
        <FiUsers size={22} className="text-brand-primary" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Registered Customers</h1>
          <p className="text-gray-500 text-sm mt-0.5">Customers who logged in and placed orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-3xl font-bold text-brand-primary">{customers.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Registered</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-3xl font-bold text-blue-600">
            {customers.filter((c) => c.city).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">With City Info</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <p className="text-3xl font-bold text-green-600">
            {customers.filter((c) => {
              const d = new Date(c.created_at);
              const now = new Date();
              return (now.getTime() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
            }).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">This Week</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 mb-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5">
          <FiSearch className="text-gray-400" size={14} />
          <input type="text" placeholder="Search by name, phone, city..."
            value={search} onChange={(e) => setSearch(e.target.value)}
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
            <p>No customers yet. Customers appear after they log in to place an order.</p>
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
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Joined</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
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
                      <p className="text-xs text-gray-600 line-clamp-1 max-w-[180px]">{c.address}</p>
                      <p className="text-xs text-gray-400">
                        {[c.city, c.state, c.pincode].filter(Boolean).join(", ")}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <a href={`https://wa.me/91${c.phone}?text=${waMsg(c)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors">
                        <FaWhatsapp size={12} /> Message
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-500">
              {filtered.length} of {customers.length} customers
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-14 h-14 rounded-full bg-brand-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl">{selected.full_name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <p className="font-bold text-gray-800 text-lg">{selected.full_name}</p>
                <p className="text-xs text-gray-400">Since {new Date(selected.created_at).toLocaleDateString("en-IN")}</p>
              </div>
              <button onClick={() => setSelected(null)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <FiPhone size={14} className="text-brand-primary mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Phone / WhatsApp</p>
                  <p className="font-semibold text-gray-800">+91{selected.phone}</p>
                </div>
              </div>
              {selected.email && (
                <div className="flex items-start gap-2">
                  <FiMail size={14} className="text-brand-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="font-semibold text-gray-800">{selected.email}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-2">
                <FiMapPin size={14} className="text-brand-primary mt-0.5" />
                <div>
                  <p className="text-xs text-gray-400">Delivery Address</p>
                  <p className="font-semibold text-gray-800">{selected.address}</p>
                  <p className="text-sm text-gray-500">{[selected.city, selected.state, selected.pincode].filter(Boolean).join(", ")}</p>
                </div>
              </div>
            </div>
            <a href={`https://wa.me/91${selected.phone}?text=${waMsg(selected)}`}
              target="_blank" rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl transition-all">
              <FaWhatsapp size={18} /> Send WhatsApp Message
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
