"use client";
import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { FiSave, FiSearch, FiDollarSign, FiTruck, FiPercent, FiInfo, FiZap } from "react-icons/fi";
import { MdCalculate } from "react-icons/md";

interface Product {
  id: string; name: string; brand: string; category: string;
  price: number; mrp: number; discount: number; images: string[];
  in_stock: boolean; cost_price?: number;
}
interface PriceEdit { price: string; mrp: string; cost_price: string; }

// ── Delivery cost estimate by order value (Shiprocket approx rates) ──
function estimateDelivery(salePrice: number): number {
  if (salePrice >= 999) return 0;        // Free delivery above ₹999
  if (salePrice >= 500) return 60;
  if (salePrice >= 300) return 80;
  return 99;
}

// ── Smart price calculator ────────────────────────────────────────────
// Given cost price, delivery buffer %, and profit margin %, returns optimal sale price
function calcSmartPrice(
  costPrice: number,
  deliveryBuffer: number,   // % of cost to buffer for delivery
  profitMarginPct: number,  // desired profit % on cost
  mrp: number
): { salePrice: number; profit: number; profitPct: number; deliveryCovered: number } {
  const deliveryCost = (costPrice * deliveryBuffer) / 100;
  const profit       = (costPrice * profitMarginPct) / 100;
  const raw          = costPrice + deliveryCost + profit;
  // Round to nearest ₹9 (psychological pricing — ₹299, ₹399 etc.)
  const salePrice    = Math.min(Math.ceil(raw / 10) * 10 - 1, mrp - 1);
  const actualProfit = salePrice - costPrice - deliveryCost;
  const actualPct    = costPrice > 0 ? (actualProfit / costPrice) * 100 : 0;
  return { salePrice, profit: actualProfit, profitPct: actualPct, deliveryCovered: deliveryCost };
}

// ── Category-wise recommended margin (based on your business) ────────
const CATEGORY_MARGINS: Record<string, number> = {
  "Electronics":      18,
  "Hair Care":        22,
  "Skin Care":        25,
  "Cosmetics":        28,
  "Makeup":           28,
  "Body Care":        25,
  "Perfumes":         30,
  "Purses & Bags":    35,
  "Wax & Accessories":30,
};

export default function PriceManager() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [edits, setEdits]           = useState<Record<string, PriceEdit>>({});
  const [saving, setSaving]         = useState<Record<string, boolean>>({});
  const [saved, setSaved]           = useState<Record<string, boolean>>({});
  const [filter, setFilter]         = useState("All");
  const [view, setView]             = useState<"simple" | "smart">("smart");
  const [hoveredImg, setHoveredImg] = useState<{ src: string; name: string } | null>(null);

  // Global smart pricing controls
  const [globalDeliveryBuffer, setGlobalDeliveryBuffer] = useState(8);   // 8% of cost
  const [globalMargin, setGlobalMargin]                 = useState(25);  // 25% profit
  const [applyingAll, setApplyingAll]                   = useState(false);
  const [appliedCount, setAppliedCount]                 = useState(0);

  const categories = ["All","Hair Care","Skin Care","Makeup","Cosmetics","Perfumes","Body Care","Electronics","Purses & Bags","Wax & Accessories"];

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(({ data }) => { setProducts(data || []); setLoading(false); });
  }, []);

  const filtered = useMemo(() => products.filter((p) => {
    const s = search.toLowerCase();
    return (p.name.toLowerCase().includes(s) || p.brand.toLowerCase().includes(s)) &&
           (filter === "All" || p.category === filter);
  }), [products, search, filter]);

  const getEdit = (p: Product): PriceEdit =>
    edits[p.id] || { price: String(p.price), mrp: String(p.mrp), cost_price: String(p.cost_price || "") };

  const handleChange = (id: string, field: keyof PriceEdit, val: string) => {
    const p = products.find((x) => x.id === id)!;
    setEdits((prev) => ({ ...prev, [id]: { ...getEdit(p), [field]: val } }));
  };

  // Apply smart pricing to one product
  const applySmartPrice = (p: Product, deliveryBuf: number, margin: number) => {
    const edit = getEdit(p);
    const cost = parseFloat(edit.cost_price);
    const mrp  = parseFloat(edit.mrp);
    if (!cost || cost <= 0 || !mrp) return;
    const catMargin = CATEGORY_MARGINS[p.category] || margin;
    const { salePrice } = calcSmartPrice(cost, deliveryBuf, catMargin, mrp);
    setEdits((prev) => ({ ...prev, [p.id]: { ...getEdit(p), price: String(salePrice) } }));
  };

  // Apply smart pricing to ALL filtered products
  const applyAllSmartPrices = async () => {
    setApplyingAll(true); setAppliedCount(0);
    let count = 0;
    for (const p of filtered) {
      const edit = getEdit(p);
      const cost = parseFloat(edit.cost_price);
      const mrp  = parseFloat(edit.mrp);
      if (cost > 0 && mrp > 0) {
        const catMargin = CATEGORY_MARGINS[p.category] || globalMargin;
        const { salePrice } = calcSmartPrice(cost, globalDeliveryBuffer, catMargin, mrp);
        setEdits((prev) => ({ ...prev, [p.id]: { ...getEdit(p), price: String(salePrice) } }));
        count++;
        setAppliedCount(count);
        await new Promise((r) => setTimeout(r, 10)); // small delay for UI
      }
    }
    setApplyingAll(false);
  };

  const savePrice = async (p: Product) => {
    const edit = getEdit(p);
    const price      = parseFloat(edit.price);
    const mrp        = parseFloat(edit.mrp);
    const cost_price = parseFloat(edit.cost_price);
    if (!price || !mrp || price <= 0 || mrp <= 0) return;
    setSaving((prev) => ({ ...prev, [p.id]: true }));
    const body: Record<string, number> = { price, mrp };
    if (cost_price > 0) body.cost_price = cost_price;
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving((prev) => ({ ...prev, [p.id]: false }));
    if (res.ok) {
      setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, price, mrp, cost_price } : x));
      setSaved((prev) => ({ ...prev, [p.id]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [p.id]: false })), 2500);
    }
  };

  const saveAll = async () => {
    const toSave = filtered.filter((p) => {
      const e = getEdit(p);
      return e.price !== String(p.price) || e.mrp !== String(p.mrp);
    });
    for (const p of toSave) await savePrice(p);
  };

  const disc = (price: string, mrp: string) => {
    const p = parseFloat(price), m = parseFloat(mrp);
    if (!p || !m || m <= p) return 0;
    return Math.floor(((m - p) / m) * 100);
  };

  const totalProducts       = filtered.length;
  const withCost            = filtered.filter((p) => { const e = getEdit(p); return parseFloat(e.cost_price) > 0; }).length;
  const pendingChanges      = filtered.filter((p) => { const e = getEdit(p); return e.price !== String(p.price) || e.mrp !== String(p.mrp); }).length;

  return (
    <div>
      {/* Floating Image Preview on Hover */}
      {hoveredImg && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fadeIn">
            <Image
              src={hoveredImg.src}
              alt={hoveredImg.name}
              width={220}
              height={220}
              className="object-contain w-[220px] h-[220px]"
            />
            <p className="text-xs text-gray-600 text-center px-3 py-2 font-medium line-clamp-2 max-w-[220px]">
              {hoveredImg.name}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <FiDollarSign size={22} className="text-brand-primary" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Smart Price Manager</h1>
            <p className="text-gray-500 text-sm">Cost price → auto calculate delivery + profit → set sale price</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button onClick={() => setView("smart")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view==="smart"?"bg-white shadow text-brand-primary":"text-gray-500"}`}>
              🧠 Smart
            </button>
            <button onClick={() => setView("simple")} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view==="simple"?"bg-white shadow text-gray-800":"text-gray-500"}`}>
              ✏️ Simple
            </button>
          </div>
          {pendingChanges > 0 && (
            <button onClick={saveAll} className="flex items-center gap-1.5 bg-brand-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors">
              <FiSave size={13} /> Save All ({pendingChanges})
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total Products", value: totalProducts, color: "text-gray-800", bg: "bg-gray-50" },
          { label: "Cost Price Added", value: `${withCost}/${totalProducts}`, color: "text-blue-700", bg: "bg-blue-50" },
          { label: "Pending Changes", value: pendingChanges, color: "text-amber-700", bg: "bg-amber-50" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-gray-100`}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Smart pricing controls — only in smart view */}
      {view === "smart" && (
        <div className="bg-gradient-to-r from-purple-50 to-brand-light rounded-2xl p-5 mb-5 border border-purple-100">
          <div className="flex items-center gap-2 mb-3">
            <MdCalculate size={18} className="text-purple-600" />
            <h2 className="font-bold text-gray-800 text-sm">Smart Pricing Calculator</h2>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">AUTO</span>
          </div>

          {/* How it works */}
          <div className="bg-white/70 rounded-xl p-3 mb-4 text-xs text-gray-600 space-y-1">
            <p className="font-bold text-gray-700 mb-1">Formula: Sale Price = Cost + Delivery Buffer + Profit</p>
            <p>• <strong>Cost Price</strong> = What you paid distributor (Rate column in your invoice)</p>
            <p>• <strong>Delivery Buffer</strong> = % of cost kept aside for shipping charges</p>
            <p>• <strong>Profit Margin</strong> = Your earnings above cost (category-wise auto-set)</p>
            <p>• <strong>Free Delivery</strong> = Shown to customer when sale price ≥ ₹999</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                <FiTruck size={11} className="inline mr-1" />Delivery Buffer %
              </label>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={20} value={globalDeliveryBuffer}
                  onChange={(e) => setGlobalDeliveryBuffer(Number(e.target.value))}
                  className="flex-1 accent-purple-600" />
                <span className="text-sm font-black text-purple-700 w-8">{globalDeliveryBuffer}%</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Covers Shiprocket/courier charges</p>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 block mb-1">
                <FiPercent size={11} className="inline mr-1" />Default Profit %
              </label>
              <div className="flex items-center gap-2">
                <input type="range" min={10} max={60} value={globalMargin}
                  onChange={(e) => setGlobalMargin(Number(e.target.value))}
                  className="flex-1 accent-brand-primary" />
                <span className="text-sm font-black text-brand-primary w-8">{globalMargin}%</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Category margins override this</p>
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={applyAllSmartPrices}
                disabled={applyingAll}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60"
              >
                <FiZap size={14} />
                {applyingAll ? `Calculating... ${appliedCount}` : "Apply Smart Prices to All"}
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-1">Prices with cost will be updated</p>
            </div>
          </div>

          {/* Category margin legend */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {Object.entries(CATEGORY_MARGINS).map(([cat, margin]) => (
              <span key={cat} className="text-[10px] bg-white border border-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                {cat}: <strong>{margin}%</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
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
                <tr className="bg-gray-50 border-b border-gray-100 text-xs">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">MRP</th>
                  {view === "smart" && (
                    <th className="text-left px-4 py-3 font-semibold text-blue-600">Cost Price ₹ <span className="text-[9px] text-gray-400">(Invoice Rate)</span></th>
                  )}
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">
                    {view === "smart" ? "Sale Price ₹" : "Selling Price ₹"}
                  </th>
                  {view === "smart" && (
                    <>
                      <th className="text-left px-4 py-3 font-semibold text-green-600">Profit</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-500">Delivery</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600">Auto</th>
                    </>
                  )}
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Disc%</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Save</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const edit      = getEdit(p);
                  const cost      = parseFloat(edit.cost_price) || 0;
                  const salePrice = parseFloat(edit.price) || 0;
                  const mrp       = parseFloat(edit.mrp) || p.mrp;
                  const discPct   = disc(edit.price, edit.mrp);
                  const changed   = edit.price !== String(p.price) || edit.mrp !== String(p.mrp) || edit.cost_price !== String(p.cost_price || "");
                  const profitAmt = cost > 0 ? salePrice - cost : null;
                  const profitPct = cost > 0 && profitAmt !== null ? ((profitAmt / cost) * 100).toFixed(0) : null;
                  const delivery  = salePrice >= 999 ? "FREE" : `~₹${estimateDelivery(salePrice)}`;
                  const isGoodMargin = profitPct !== null && parseInt(profitPct) >= 15;
                  const isBadMargin  = profitPct !== null && parseInt(profitPct) < 10;

                  return (
                    <tr key={p.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${changed ? "bg-yellow-50/40" : ""}`}>
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-lg bg-brand-light overflow-hidden flex-shrink-0 cursor-pointer"
                            onMouseEnter={() => p.images?.[0] && setHoveredImg({ src: p.images[0], name: p.name })}
                            onMouseLeave={() => setHoveredImg(null)}
                          >
                            {p.images?.[0] ? <Image src={p.images[0]} alt={p.name} width={36} height={36} className="object-cover w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-base">💄</div>}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 line-clamp-1 max-w-[160px] text-xs">{p.name}</p>
                            <p className="text-[10px] text-gray-400">{p.brand} · <span className="text-blue-500">{p.category}</span></p>
                          </div>
                        </div>
                      </td>

                      {/* MRP */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2.5 py-1.5 w-24">
                          <span className="text-gray-400 text-[10px]">₹</span>
                          <input type="number" value={edit.mrp} min={1} step={1}
                            onChange={(e) => handleChange(p.id, "mrp", e.target.value)}
                            className="bg-transparent outline-none text-xs text-gray-800 w-full font-semibold" />
                        </div>
                      </td>

                      {/* Cost Price (smart view only) */}
                      {view === "smart" && (
                        <td className="px-4 py-3">
                          <div className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 w-24 border ${cost > 0 ? "bg-blue-50 border-blue-200" : "bg-gray-100 border-transparent"}`}>
                            <span className="text-gray-400 text-[10px]">₹</span>
                            <input type="number" value={edit.cost_price} min={0} step={0.5} placeholder="0"
                              onChange={(e) => handleChange(p.id, "cost_price", e.target.value)}
                              className="bg-transparent outline-none text-xs text-blue-800 w-full font-semibold placeholder:text-gray-300" />
                          </div>
                        </td>
                      )}

                      {/* Sale Price */}
                      <td className="px-4 py-3">
                        <div className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 w-24 border ${changed ? "bg-amber-50 border-amber-300" : "bg-gray-100 border-transparent"}`}>
                          <span className="text-gray-400 text-[10px]">₹</span>
                          <input type="number" value={edit.price} min={1} step={1}
                            onChange={(e) => handleChange(p.id, "price", e.target.value)}
                            className="bg-transparent outline-none text-xs text-gray-900 w-full font-bold" />
                        </div>
                      </td>

                      {/* Profit (smart view) */}
                      {view === "smart" && (
                        <td className="px-4 py-3">
                          {profitAmt !== null ? (
                            <div className={`text-xs font-bold ${isBadMargin ? "text-red-500" : isGoodMargin ? "text-green-600" : "text-amber-600"}`}>
                              <p>₹{profitAmt.toFixed(0)}</p>
                              <p className="text-[10px]">{profitPct}% margin</p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-300">Add cost →</span>
                          )}
                        </td>
                      )}

                      {/* Delivery coverage (smart view) */}
                      {view === "smart" && (
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${delivery === "FREE" ? "bg-green-100 text-green-700" : "bg-orange-50 text-orange-600"}`}>
                            {delivery}
                          </span>
                        </td>
                      )}

                      {/* Auto-calculate button (smart view) */}
                      {view === "smart" && (
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => applySmartPrice(p, globalDeliveryBuffer, globalMargin)}
                            disabled={cost <= 0}
                            className="p-1.5 bg-purple-100 hover:bg-purple-200 text-purple-600 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Auto-calculate sale price"
                          >
                            <FiZap size={12} />
                          </button>
                        </td>
                      )}

                      {/* Discount % */}
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold ${discPct >= 20 ? "text-green-600" : discPct > 0 ? "text-gray-600" : "text-gray-300"}`}>
                          {discPct > 0 ? `${discPct}% OFF` : "—"}
                        </span>
                      </td>

                      {/* Save */}
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => savePrice(p)}
                          disabled={saving[p.id] || !changed}
                          className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 ${
                            saved[p.id] ? "bg-green-500 text-white" :
                            changed ? "bg-brand-primary hover:bg-brand-dark text-white shadow-sm" :
                            "bg-gray-100 text-gray-400"
                          }`}>
                          {saving[p.id] ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : saved[p.id] ? "✓" : <FiSave size={12} />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-5 py-3 bg-gray-50 border-t text-xs text-gray-500 flex items-center justify-between">
              <span>{filtered.length} products</span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> Good margin ≥15%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> OK 10-15%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Low &lt;10%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
