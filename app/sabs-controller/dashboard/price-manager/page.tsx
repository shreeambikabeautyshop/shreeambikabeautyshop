"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FiSave, FiSearch, FiDollarSign } from "react-icons/fi";

interface Product {
  id: string; name: string; brand: string; category: string;
  price: number; mrp: number; discount: number; images: string[];
  in_stock: boolean;
}

interface PriceEdit { price: string; mrp: string; }

export default function PriceManager() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [edits, setEdits]         = useState<Record<string, PriceEdit>>({});
  const [saving, setSaving]       = useState<Record<string, boolean>>({});
  const [saved, setSaved]         = useState<Record<string, boolean>>({});
  const [filter, setFilter]       = useState("All");

  const categories = ["All", "Hair Care", "Skin Care", "Makeup", "Cosmetics", "Perfumes", "Body Care", "Electronics", "Purses & Bags", "Wax & Accessories"];

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(({ data }) => { setProducts(data || []); setLoading(false); });
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = filter === "All" || p.category === filter;
    return matchSearch && matchCat;
  });

  const getEdit = (p: Product): PriceEdit =>
    edits[p.id] || { price: String(p.price), mrp: String(p.mrp) };

  const handleChange = (id: string, field: "price" | "mrp", val: string) => {
    setEdits((prev) => ({ ...prev, [id]: { ...getEdit(products.find((p) => p.id === id)!), [field]: val } }));
  };

  const savePrice = async (p: Product) => {
    const edit = getEdit(p);
    const price = parseFloat(edit.price);
    const mrp   = parseFloat(edit.mrp);
    if (!price || !mrp || price <= 0 || mrp <= 0) return;

    setSaving((prev) => ({ ...prev, [p.id]: true }));
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price, mrp }),
    });
    setSaving((prev) => ({ ...prev, [p.id]: false }));
    if (res.ok) {
      setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, price, mrp } : x));
      setSaved((prev) => ({ ...prev, [p.id]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [p.id]: false })), 2000);
    }
  };

  const discount = (price: string, mrp: string) => {
    const p = parseFloat(price), m = parseFloat(mrp);
    if (!p || !m || m <= p) return 0;
    return Math.floor(((m - p) / m) * 100);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FiDollarSign size={22} className="text-brand-primary" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Price Manager</h1>
          <p className="text-gray-500 text-sm mt-0.5">Update selling price and MRP for any product instantly</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 flex-1">
          <FiSearch className="text-gray-400" size={14} />
          <input type="text" placeholder="Search products or brands..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent outline-none text-sm text-gray-700 w-full" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand-primary">
          {categories.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-[300px]">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Current Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-[180px]">Selling Price ₹</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 w-[180px]">MRP ₹</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Discount</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Save</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const edit = getEdit(p);
                  const disc = discount(edit.price, edit.mrp);
                  const changed = edit.price !== String(p.price) || edit.mrp !== String(p.mrp);
                  return (
                    <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${changed ? "bg-yellow-50/30" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-light overflow-hidden flex-shrink-0">
                            {p.images?.[0] ? (
                              <Image src={p.images[0]} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                            ) : <div className="w-full h-full flex items-center justify-center text-lg">💄</div>}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 line-clamp-1 max-w-[200px]">{p.name}</p>
                            <p className="text-[11px] text-gray-400">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">{p.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-900">₹{p.price}</p>
                        <p className="text-xs text-gray-400 line-through">₹{p.mrp}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-3 py-2">
                          <span className="text-gray-400 text-xs">₹</span>
                          <input type="number" value={edit.price} min={1} step={0.01}
                            onChange={(e) => handleChange(p.id, "price", e.target.value)}
                            className="bg-transparent outline-none text-sm text-gray-800 w-full font-semibold" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-xl px-3 py-2">
                          <span className="text-gray-400 text-xs">₹</span>
                          <input type="number" value={edit.mrp} min={1} step={0.01}
                            onChange={(e) => handleChange(p.id, "mrp", e.target.value)}
                            className="bg-transparent outline-none text-sm text-gray-800 w-full font-semibold" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${disc > 0 ? "text-green-600" : "text-gray-400"}`}>
                          {disc > 0 ? `${disc}% OFF` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => savePrice(p)}
                          disabled={saving[p.id] || !changed}
                          className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 ${
                            saved[p.id] ? "bg-green-500 text-white" :
                            changed ? "bg-brand-primary hover:bg-brand-dark text-white shadow-sm" :
                            "bg-gray-100 text-gray-400"
                          }`}>
                          {saving[p.id] ? (
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : saved[p.id] ? "✓" : <FiSave size={12} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-500">
              {filtered.length} products shown
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
