"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiEdit2, FiTrash2, FiPlusCircle, FiSearch, FiShare2, FiCopy, FiZap, FiImage, FiEye, FiX, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  discount: number;
  description?: string;
  images: string[];
  in_stock: boolean;
  featured: boolean;
  trending: boolean;
  created_at: string;
}

// AI-suggested corrections for a product
interface AiCorrection {
  name: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  description: string;
}

const BASE_URL = "https://www.shreeambikabeauty.com";

type CaptionType = "whatsapp" | "instagram" | "alt";

interface CaptionData { text: string; chars: number; provider: string; }
// Cache key: "productId:type"
type CaptionCache = Record<string, CaptionData>;

export default function ProductsList() {
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [deleting, setDeleting]     = useState<string | null>(null);
  const [copied, setCopied]         = useState<string | null>(null);
  const [shortUrls, setShortUrls]   = useState<Record<string, string>>({});
  const [shortLoading, setShortLoading] = useState<string | null>(null);

  // Single popup for all caption types
  const [captionModal, setCaptionModal] = useState<{ product: Product } | null>(null);
  const [activeTab, setActiveTab]       = useState<CaptionType>("whatsapp");
  const [loadingType, setLoadingType]   = useState<CaptionType | null>(null);
  const [captionCache, setCaptionCache] = useState<CaptionCache>({});
  const [copiedKey, setCopiedKey]       = useState<string | null>(null);
  const [view, setView] = useState<"table" | "images">("table");
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);

  // ── AI Fix Details state ──────────────────────────────────────────
  const [fixLoading,    setFixLoading]    = useState<Record<string, boolean>>({});  // { [productId]: true }
  const [fixModal,      setFixModal]      = useState<{
    product: Product;
    correction: AiCorrection;
  } | null>(null);
  const [fixApplying,   setFixApplying]   = useState(false);
  const [fixDone,       setFixDone]       = useState<Record<string, boolean>>({});  // { [productId]: true }

  const fetchProducts = () => {
    setLoading(true);
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then(({ data }) => { setProducts(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  };

  const getProductUrl = (p: Product) => `${BASE_URL}/products/${p.slug || p.id}`;

  const getOrCreateShortUrl = async (p: Product): Promise<string> => {
    if (shortUrls[p.id]) return shortUrls[p.id];
    try {
      const res  = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: p.id, product_slug: p.slug || p.id, product_name: p.name }),
      });
      const json = await res.json();
      if (json.short_url) {
        setShortUrls((prev) => ({ ...prev, [p.id]: json.short_url }));
        return json.short_url;
      }
    } catch { /* fall through */ }
    return getProductUrl(p);
  };

  const handleCopyUrl = async (p: Product) => {
    setShortLoading(p.id);
    const url = await getOrCreateShortUrl(p);
    await navigator.clipboard.writeText(url);
    setShortLoading(null);
    setCopied(p.id);
    setTimeout(() => setCopied(null), 2500);
  };

  const handleShareWhatsApp = async (p: Product) => {
    const shareUrl = await getOrCreateShortUrl(p);
    const msg = encodeURIComponent(
      `*${p.name}*\nPrice: Rs.${p.price} (MRP Rs.${p.mrp}) - ${p.discount}% OFF\n100% Original Product\n\nView Product: ${shareUrl}\n\nOrder on WhatsApp: +918291455297\nShree Ambika Beauty Shop`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const handleGenerateCaption = async (p: Product, type: CaptionType = "whatsapp", forceRegenerate = false) => {
    const cacheKey = `${p.id}:${type}`;
    if (!forceRegenerate && captionCache[cacheKey]) return; // already cached
    setLoadingType(type);
    const shortUrl = await getOrCreateShortUrl(p);
    try {
      const res = await fetch("/api/admin/generate-caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: p.name, brand: p.brand, category: p.category,
          price: p.price, mrp: p.mrp, discount: p.discount,
          slug: p.slug || p.id, shortUrl, type,
        }),
      });
      const json = await res.json();
      const resultText = type === "alt" ? json.alt : json.caption;
      if (resultText) {
        setCaptionCache(prev => ({ ...prev, [cacheKey]: { text: resultText, chars: json.chars, provider: json.provider } }));
      }
    } catch { /* silent */ }
    setLoadingType(null);
  };

  const openCaptionModal = async (p: Product) => {
    setCaptionModal({ product: p });
    setActiveTab("whatsapp");
    // Auto-generate WhatsApp caption immediately if not cached
    const waKey = `${p.id}:whatsapp`;
    if (!captionCache[waKey]) {
      handleGenerateCaption(p, "whatsapp");
    }
  };

  // ── AI Fix Details — analyze product image and suggest corrections ──
  const handleAiFix = async (p: Product) => {
    if (!p.images?.[0]) { alert("No image found for this product."); return; }
    // Allow multiple concurrent — each product tracks its own loading state
    setFixLoading(prev => ({ ...prev, [p.id]: true }));
    try {
      const res  = await fetch("/api/admin/generate-product", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ imageUrl: p.images[0] }),
      });
      const json = await res.json();
      if (!res.ok || !json.data) throw new Error(json.error || "AI analysis failed");
      const d = json.data;
      setFixModal({
        product: p,
        correction: {
          name:        String(d.name        || p.name),
          brand:       String(d.brand       || p.brand),
          category:    String(d.category    || p.category),
          price:       Number(d.price       || p.price),
          mrp:         Number(d.mrp         || p.mrp),
          description: String(d.description || ""),
        },
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "AI fix failed");
    }
    setFixLoading(prev => ({ ...prev, [p.id]: false }));
  };

  // ── Apply AI corrections to DB ───────────────────────────────────
  const handleApplyFix = async () => {
    if (!fixModal) return;
    setFixApplying(true);
    const { product, correction } = fixModal;
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:        correction.name,
          brand:       correction.brand,
          category:    correction.category,
          price:       correction.price,
          mrp:         correction.mrp,
          description: correction.description,
        }),
      });
      if (!res.ok) throw new Error("Update failed");
      // Update local state
      setProducts(prev => prev.map(p =>
        p.id === product.id
          ? { ...p, name: correction.name, brand: correction.brand,
              category: correction.category, price: correction.price, mrp: correction.mrp }
          : p
      ));
      setFixDone(prev => ({ ...prev, [product.id]: true }));
      setTimeout(() => setFixDone(prev => ({ ...prev, [product.id]: false })), 4000);
      setFixModal(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Apply failed");
    }
    setFixApplying(false);
  };

  const handleTabChange = (p: Product, type: CaptionType) => {
    setActiveTab(type);
    const key = `${p.id}:${type}`;
    if (!captionCache[key]) {
      handleGenerateCaption(p, type);
    }
  };

  const handleCopyText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Products</h1>
          <p className="text-gray-500 text-sm">
            <span className="font-bold text-brand-primary text-base">{products.length}</span> products total
            {search && <span className="ml-2">• {filtered.length} results</span>}
          </p>
        </div>
        <Link href="/sabs-controller/dashboard/products/add"
          className="flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
          <FiPlusCircle /> Add Product
        </Link>
      </div>

      {/* Search + View toggle */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 flex-1">
            <FiSearch className="text-gray-400" />
            <input type="text" placeholder="Search by name, brand, category..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700 flex-1" />
            {search && (
              <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 text-xs">✕ Clear</button>
            )}
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button onClick={() => setView("table")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "table" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>
              ☰ Table
            </button>
            <button onClick={() => setView("images")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === "images" ? "bg-white shadow-sm text-gray-800" : "text-gray-500 hover:text-gray-700"}`}>
              🖼 Images
            </button>
          </div>
        </div>
      </div>

      {/* Image view */}
      {view === "images" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          {loading ? (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3">
              {filtered.map((p) => (
                <div key={p.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-brand-light border border-gray-100 hover:shadow-lg transition-all hover:scale-[1.02]">
                  {p.images?.[0] ? (
                    <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">💄</div>
                  )}
                  {/* Hover overlay: eye icon opens lightbox, edit icon goes to edit page */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center gap-2">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
                      {p.images?.[0] && (
                        <button
                          type="button"
                          onClick={() => setLightboxImage({ url: p.images[0], name: p.name })}
                          className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                          title="View image"
                        >
                          <FiEye size={14} className="text-gray-800" />
                        </button>
                      )}
                      <Link href={`/sabs-controller/dashboard/products/edit/${p.id}`}
                        className="w-8 h-8 bg-brand-primary/90 rounded-full flex items-center justify-center hover:bg-brand-primary transition-colors"
                        title="Edit product">
                        <FiEdit2 size={12} className="text-white" />
                      </Link>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-[9px] font-bold line-clamp-2 leading-tight">{p.name}</p>
                    </div>
                  </div>
                  {!p.in_stock && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">Out</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <FiPlusCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No products found</p>
              <Link href="/sabs-controller/dashboard/products/add" className="text-brand-primary text-sm hover:underline mt-1 inline-block">
                Add your first product →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-center px-3 py-3 font-semibold text-gray-500 w-10">#</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Brand</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Tags</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, idx) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-center">
                        <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center mx-auto">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl bg-brand-light overflow-hidden flex-shrink-0 flex items-center justify-center relative group/thumb cursor-pointer"
                            onClick={() => p.images?.[0] && setLightboxImage({ url: p.images[0], name: p.name })}
                          >
                            {p.images?.[0] ? (
                              <>
                                <Image src={p.images[0]} alt={p.name} width={48} height={48} className="object-cover w-full h-full" />
                                <div className="absolute inset-0 bg-black/0 group-hover/thumb:bg-black/40 transition-colors flex items-center justify-center">
                                  <FiEye size={16} className="text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity" />
                                </div>
                              </>
                            ) : (
                              <span className="text-xl">📦</span>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-gray-800 line-clamp-1 max-w-[160px] block">{p.name}</span>
                            <span className="text-[10px] text-gray-400 truncate max-w-[160px] block">
                              /products/{(p.slug || p.id).slice(0, 22)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{p.brand}</td>
                      <td className="px-4 py-3">
                        <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">{p.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-gray-800">₹{p.price}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${p.in_stock ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                          {p.in_stock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {p.featured && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">⭐</span>}
                          {p.trending && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">🔥</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          {/* Row 1: Caption + AI Fix */}
                          <div className="flex items-center gap-1.5">
                            {/* Caption button */}
                            <button
                              onClick={() => openCaptionModal(p)}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                                captionCache[`${p.id}:whatsapp`] || captionCache[`${p.id}:instagram`]
                                  ? "bg-green-500 hover:bg-green-600 text-white"
                                  : "bg-orange-500 hover:bg-orange-600 text-white"
                              }`}
                              title="Generate WA Caption + IG Caption + Alt Text"
                            >
                              <FiZap size={11} />
                              <span>{captionCache[`${p.id}:whatsapp`] || captionCache[`${p.id}:instagram`] ? "Caption ✓" : "Caption"}</span>
                            </button>
                            {/* AI Fix Details button */}
                            <button
                              onClick={() => handleAiFix(p)}
                              disabled={fixLoading[p.id]}
                              title="AI auto-corrects name, brand, category, price by analyzing the product image"
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                                fixDone[p.id]
                                  ? "bg-green-500 text-white"
                                  : fixLoading[p.id]
                                  ? "bg-purple-200 text-purple-400 animate-pulse cursor-not-allowed"
                                  : "bg-purple-600 hover:bg-purple-700 text-white"
                              }`}
                            >
                              {fixLoading[p.id] ? (
                                <><div className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /> Analyzing...</>
                              ) : fixDone[p.id] ? (
                                <><FiCheckCircle size={11} /> Fixed ✓</>
                              ) : (
                                <><FiAlertCircle size={11} /> AI Fix</>
                              )}
                            </button>
                          </div>
                          {/* Row 2: Edit + Share + WhatsApp + Delete */}
                          <div className="flex items-center gap-1.5">
                          {/* Edit */}
                          <Link href={`/sabs-controller/dashboard/products/edit/${p.id}`}
                            className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors" title="Edit">
                            <FiEdit2 size={13} />
                          </Link>
                          {/* Copy short URL */}
                          <button onClick={() => handleCopyUrl(p)} disabled={shortLoading === p.id}
                            className={`p-2 rounded-lg transition-colors text-xs font-bold ${
                              copied === p.id ? "bg-green-100 text-green-600"
                              : shortLoading === p.id ? "bg-gray-100 text-gray-400 animate-pulse"
                              : "bg-gray-50 hover:bg-gray-100 text-gray-500"}`}
                            title="Copy short URL">
                            {copied === p.id ? "✓" : shortLoading === p.id ? "..." : <FiShare2 size={13} />}
                          </button>
                          {/* WhatsApp */}
                          <button onClick={() => handleShareWhatsApp(p)}
                            className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors" title="Share on WhatsApp">
                            <FaWhatsapp size={13} />
                          </button>
                          {/* Delete */}
                          <button onClick={() => handleDelete(p.id, p.name)} disabled={deleting === p.id}
                            className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg transition-colors disabled:opacity-50" title="Delete">
                            <FiTrash2 size={13} />
                          </button>
                          </div>{/* end Row 2 */}
                        </div>{/* end flex-col */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
                <span>Showing {filtered.length} of {products.length} products</span>
                <span>Total value: ₹{products.reduce((sum, p) => sum + p.price, 0).toLocaleString("en-IN")}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── AI Fix Details Modal ── */}
      {fixModal && (() => {
        const { product: p, correction: c } = fixModal;
        const changed = (field: keyof AiCorrection) => {
          const oldVal = String(p[field as keyof Product] ?? "");
          const newVal = String(c[field] ?? "");
          return oldVal.trim().toLowerCase() !== newVal.trim().toLowerCase();
        };
        const anyChanged = (["name","brand","category","price","mrp"] as (keyof AiCorrection)[]).some(changed);

        return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => !fixApplying && setFixModal(null)}>
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                    <span className="text-purple-600">✨</span> AI Product Fix
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Review AI-suggested corrections before applying</p>
                </div>
                {!fixApplying && (
                  <button onClick={() => setFixModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                )}
              </div>

              {/* Comparison table */}
              <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {/* Product image */}
                {p.images?.[0] && (
                  <div className="flex items-center gap-3 mb-4">
                    <Image src={p.images[0]} alt={p.name} width={60} height={60}
                      className="rounded-xl object-cover w-16 h-16 border border-gray-100" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Analyzing product</p>
                      <p className="text-xs font-semibold text-gray-700 line-clamp-2 max-w-[280px]">{p.name}</p>
                    </div>
                  </div>
                )}

                {/* Field comparison */}
                {([
                  { key: "name",     label: "Product Name" },
                  { key: "brand",    label: "Brand" },
                  { key: "category", label: "Category" },
                  { key: "price",    label: "Price (₹)" },
                  { key: "mrp",      label: "MRP (₹)" },
                ] as { key: keyof AiCorrection; label: string }[]).map(({ key, label }) => {
                  const isChanged = changed(key);
                  return (
                    <div key={key}
                      className={`rounded-xl p-3 border ${isChanged ? "border-purple-200 bg-purple-50" : "border-gray-100 bg-gray-50"}`}>
                      <p className={`text-[10px] font-bold uppercase mb-1.5 ${isChanged ? "text-purple-600" : "text-gray-400"}`}>
                        {label} {isChanged && <span className="ml-1">← AI updated</span>}
                      </p>
                      <div className={`flex items-center gap-2 ${isChanged ? "flex-col items-start" : ""}`}>
                        {isChanged ? (
                          <>
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">OLD</span>
                              <span className="text-xs text-gray-500 line-through">{String(p[key as keyof Product] ?? "")}</span>
                            </div>
                            <div className="flex items-center gap-2 w-full">
                              <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-semibold">NEW</span>
                              <span className="text-xs font-bold text-gray-800">{String(c[key])}</span>
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-gray-600">{String(c[key])} <span className="text-gray-400">(no change)</span></span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Description preview */}
                {c.description && (
                  <div className="rounded-xl p-3 border border-blue-100 bg-blue-50">
                    <p className="text-[10px] font-bold text-blue-600 uppercase mb-1">Description (will be updated)</p>
                    <p className="text-xs text-gray-700 line-clamp-3">{c.description}</p>
                  </div>
                )}

                {!anyChanged && (
                  <div className="rounded-xl p-3 border border-green-200 bg-green-50 text-center">
                    <p className="text-sm font-bold text-green-700">✅ AI found no issues — product details look correct!</p>
                  </div>
                )}
              </div>

              {/* Footer buttons */}
              <div className="px-6 pb-5 pt-3 border-t border-gray-100 flex gap-3">
                <button onClick={() => setFixModal(null)} disabled={fixApplying}
                  className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleApplyFix} disabled={fixApplying || !anyChanged}
                  className={`flex-1 flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl text-sm transition-all ${
                    fixApplying
                      ? "bg-purple-300 text-white cursor-not-allowed"
                      : !anyChanged
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 text-white"}`}>
                  {fixApplying ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Applying...</>
                  ) : (
                    <><FiCheckCircle size={14} /> Apply {anyChanged ? "Changes" : "(No Changes)"}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Unified Caption Modal ── */}
      {captionModal && (() => {
        const p = captionModal.product;
        const waKey  = `${p.id}:whatsapp`;
        const igKey  = `${p.id}:instagram`;
        const altKey = `${p.id}:alt`;
        const current = captionCache[`${p.id}:${activeTab}`];
        const isLoading = loadingType === activeTab;

        return (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setCaptionModal(null)}>
            <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}>

              {/* Modal header */}
              <div className="px-6 pt-5 pb-3 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">AI Caption Generator</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[340px]">{p.name}</p>
                  </div>
                  <button onClick={() => setCaptionModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1.5 mt-4">
                  {([
                    { type: "whatsapp" as CaptionType, label: "💬 WhatsApp", sublabel: "280 chars", color: "bg-green-500" },
                    { type: "instagram" as CaptionType, label: "📸 Instagram", sublabel: "650 chars + hashtags", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
                    { type: "alt" as CaptionType, label: "🖼 Image Alt", sublabel: "SEO crawler", color: "bg-blue-500" },
                  ]).map(tab => (
                    <button key={tab.type}
                      onClick={() => handleTabChange(p, tab.type)}
                      className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                        activeTab === tab.type
                          ? "border-brand-primary bg-brand-light text-brand-primary"
                          : "border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100"
                      }`}>
                      <div>{tab.label}</div>
                      <div className={`text-[9px] mt-0.5 font-normal ${activeTab === tab.type ? "text-brand-primary/70" : "text-gray-400"}`}>
                        {captionCache[`${p.id}:${tab.type}`] ? "✓ Ready" : tab.sublabel}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content area */}
              <div className="px-6 py-4">
                {/* Description strip */}
                <div className={`rounded-xl px-3 py-2 mb-3 text-xs font-medium ${
                  activeTab === "whatsapp" ? "bg-green-50 text-green-700" :
                  activeTab === "instagram" ? "bg-pink-50 text-pink-700" :
                  "bg-blue-50 text-blue-700"}`}>
                  {activeTab === "whatsapp" && "💬 Compact 260-280 chars — product link, contact & location. For WhatsApp Status, forwards, business."}
                  {activeTab === "instagram" && "📸 650 chars with headline, benefits, price, CTA + 25 keyword hashtags for max reach & discoverability."}
                  {activeTab === "alt" && "🤖 SEO image alt text — Google image crawlers read this. Boosts ranking in Google Image Search."}
                </div>

                {/* Caption box */}
                <div className="bg-gray-50 rounded-2xl p-4 min-h-[120px] max-h-[260px] overflow-y-auto relative mb-4">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-24 gap-3">
                      <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-gray-400">
                        {activeTab === "whatsapp" ? "Crafting WhatsApp caption..." :
                         activeTab === "instagram" ? "Writing Instagram caption + hashtags..." :
                         "Generating SEO alt text..."}
                      </span>
                    </div>
                  ) : current ? (
                    <>
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{current.text}</pre>
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200">
                        <span className="text-[10px] text-gray-400">{current.chars} chars</span>
                        <span className={`text-[10px] font-semibold ${current.provider === "gemini" ? "text-blue-500" : "text-orange-500"}`}>
                          via {current.provider}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-24 text-gray-400 text-xs">
                      Click a tab to generate
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => current && handleCopyText(current.text, `${p.id}:${activeTab}`)}
                    disabled={!current || isLoading}
                    className={`flex-1 flex items-center justify-center gap-2 font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-40 ${
                      copiedKey === `${p.id}:${activeTab}`
                        ? "bg-green-500 text-white"
                        : activeTab === "instagram"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : activeTab === "alt"
                        ? "bg-blue-500 text-white"
                        : "bg-brand-primary text-white"}`}>
                    <FiCopy size={14} />
                    {copiedKey === `${p.id}:${activeTab}` ? "Copied! ✓" : "Copy"}
                  </button>
                  <button
                    onClick={() => handleGenerateCaption(p, activeTab, true)}
                    disabled={isLoading}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all disabled:opacity-40">
                    🔄
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* ── Lightbox Modal ── */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-2xl w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-2xl font-bold transition-colors"
              aria-label="Close lightbox"
            >
              <FiX size={28} />
            </button>
            <div className="relative w-full" style={{ maxWidth: 600 }}>
              <Image
                src={lightboxImage.url}
                alt={lightboxImage.name}
                width={600}
                height={600}
                className="rounded-2xl object-contain w-full h-auto max-h-[70vh] shadow-2xl"
                style={{ maxWidth: 600 }}
              />
            </div>
            <p className="text-white font-semibold text-center mt-4 text-sm max-w-xs leading-snug">
              {lightboxImage.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
