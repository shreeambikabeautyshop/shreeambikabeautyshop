"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiEdit2, FiTrash2, FiPlusCircle, FiSearch, FiShare2, FiCopy, FiZap, FiImage } from "react-icons/fi";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  discount: number;
  images: string[];
  in_stock: boolean;
  featured: boolean;
  trending: boolean;
  created_at: string;
}

const BASE_URL = "https://www.shreeambikabeauty.com";

// Caption type
type CaptionType = "whatsapp" | "instagram" | "alt";

interface CaptionData { text: string; chars: number; provider: string; captionType: CaptionType; }

export default function ProductsList() {
  const [products, setProducts]         = useState<Product[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [deleting, setDeleting]         = useState<string | null>(null);
  const [copied, setCopied]             = useState<string | null>(null);
  const [shortUrls, setShortUrls]       = useState<Record<string, string>>({});
  const [shortLoading, setShortLoading] = useState<string | null>(null);
  // Loading state: "productId:type"
  const [captionLoading, setCaptionLoading] = useState<string | null>(null);
  const [captionCopied, setCaptionCopied]   = useState<string | null>(null);
  const [captionPreview, setCaptionPreview] = useState<(CaptionData & { id: string }) | null>(null);
  // Cache per product per type: "productId:type" -> CaptionData
  const [captionCache, setCaptionCache] = useState<Record<string, CaptionData>>({});
  const [view, setView] = useState<"table" | "images">("table");

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
    if (!forceRegenerate && captionCache[cacheKey]) {
      setCaptionPreview({ id: p.id, ...captionCache[cacheKey] });
      return;
    }
    setCaptionLoading(`${p.id}:${type}`);
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
        const cached: CaptionData = { text: resultText, chars: json.chars, provider: json.provider, captionType: type };
        setCaptionCache((prev) => ({ ...prev, [cacheKey]: cached }));
        setCaptionPreview({ id: p.id, ...cached });
      }
    } catch { /* silent */ }
    setCaptionLoading(null);
  };

  const handleCopyCaption = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCaptionCopied(id);
    setTimeout(() => setCaptionCopied(null), 3000);
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
                <Link key={p.id} href={`/sabs-controller/dashboard/products/edit/${p.id}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-brand-light border border-gray-100 hover:shadow-lg transition-all hover:scale-[1.02]">
                  {p.images?.[0] ? (
                    <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">💄</div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity p-2 w-full">
                      <p className="text-white text-[9px] font-bold line-clamp-2 leading-tight">{p.name}</p>
                    </div>
                  </div>
                  {!p.in_stock && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">Out</span>
                  )}
                </Link>
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
                          <div className="w-12 h-12 rounded-xl bg-brand-light overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {p.images?.[0] ? (
                              <Image src={p.images[0]} alt={p.name} width={48} height={48} className="object-cover w-full h-full" />
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
                        <p className="text-xs text-gray-400 line-through">₹{p.mrp}</p>
                        <p className="text-xs text-green-600 font-semibold">{p.discount}% OFF</p>
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* WhatsApp Caption */}
                          <button onClick={() => handleGenerateCaption(p, "whatsapp")}
                            disabled={captionLoading === `${p.id}:whatsapp`}
                            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                              captionLoading === `${p.id}:whatsapp`
                                ? "bg-orange-100 text-orange-400 animate-pulse"
                                : captionCache[`${p.id}:whatsapp`]
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-orange-500 hover:bg-orange-600 text-white"}`}
                            title="WhatsApp Caption (280 chars)">
                            {captionLoading === `${p.id}:whatsapp`
                              ? <span>✨...</span>
                              : captionCache[`${p.id}:whatsapp`]
                              ? <><FaWhatsapp size={10} /><span>WA ✓</span></>
                              : <><FiZap size={10} /><span>WA</span></>}
                          </button>

                          {/* Instagram Caption */}
                          <button onClick={() => handleGenerateCaption(p, "instagram")}
                            disabled={captionLoading === `${p.id}:instagram`}
                            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                              captionLoading === `${p.id}:instagram`
                                ? "bg-pink-100 text-pink-400 animate-pulse"
                                : captionCache[`${p.id}:instagram`]
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"}`}
                            title="Instagram Caption (500 chars + hashtags)">
                            {captionLoading === `${p.id}:instagram`
                              ? <span>📸...</span>
                              : captionCache[`${p.id}:instagram`]
                              ? <><FaInstagram size={10} /><span>IG ✓</span></>
                              : <><FaInstagram size={10} /><span>IG</span></>}
                          </button>

                          {/* Image Alt Text */}
                          <button onClick={() => handleGenerateCaption(p, "alt")}
                            disabled={captionLoading === `${p.id}:alt`}
                            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                              captionLoading === `${p.id}:alt`
                                ? "bg-blue-100 text-blue-400 animate-pulse"
                                : captionCache[`${p.id}:alt`]
                                ? "bg-blue-500 hover:bg-blue-600 text-white"
                                : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                            title="SEO Image Alt Text (for crawlers)">
                            {captionLoading === `${p.id}:alt`
                              ? <span>🖼...</span>
                              : captionCache[`${p.id}:alt`]
                              ? <><FiImage size={10} /><span>Alt ✓</span></>
                              : <><FiImage size={10} /><span>Alt</span></>}
                          </button>
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
                        </div>
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

      {/* Caption Preview Modal */}
      {captionPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setCaptionPreview(null)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  {captionPreview.captionType === "whatsapp" && <><FiZap className="text-orange-500" size={16} /> WhatsApp Caption</>}
                  {captionPreview.captionType === "instagram" && <><FaInstagram className="text-pink-500" size={16} /> Instagram Caption</>}
                  {captionPreview.captionType === "alt" && <><FiImage className="text-blue-500" size={16} /> Image Alt Text</>}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                  <span className={`font-bold ${captionPreview.provider === "gemini" ? "text-blue-600" : "text-orange-500"}`}>
                    via {captionPreview.provider === "gemini" ? "✓ Gemini" : "⚡ Groq"}
                  </span>
                  <span className="bg-gray-100 text-gray-500 text-[9px] px-1.5 py-0.5 rounded-full">
                    {captionPreview.chars} chars
                    {captionPreview.captionType === "whatsapp" && " (target 260-280)"}
                    {captionPreview.captionType === "instagram" && " (target 470-500)"}
                    {captionPreview.captionType === "alt" && " (target 100-125)"}
                  </span>
                </p>
              </div>
              <button onClick={() => setCaptionPreview(null)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            {/* Type description */}
            {captionPreview.captionType === "alt" && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-3 text-xs text-blue-700">
                🤖 <strong>For image SEO:</strong> Paste this in your product image alt= attribute. Crawlers read this — it boosts Google Image Search ranking.
              </div>
            )}
            {captionPreview.captionType === "instagram" && (
              <div className="bg-pink-50 border border-pink-100 rounded-xl px-3 py-2 mb-3 text-xs text-pink-700">
                📸 <strong>Instagram optimized:</strong> Headline + benefits + price + CTA + 15-20 keyword hashtags. Copy & paste directly.
              </div>
            )}
            {captionPreview.captionType === "whatsapp" && (
              <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 mb-3 text-xs text-green-700">
                💬 <strong>WhatsApp optimized:</strong> Compact 260-280 chars with product link, contact & location.
              </div>
            )}

            {/* Caption text */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-4 relative max-h-60 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">{captionPreview.text}</pre>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={() => handleCopyCaption(captionPreview.text, captionPreview.id)}
                className={`flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl text-sm transition-all ${
                  captionCopied === captionPreview.id
                    ? "bg-green-500 text-white"
                    : captionPreview.captionType === "instagram"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                    : captionPreview.captionType === "alt"
                    ? "bg-blue-500 text-white"
                    : "bg-brand-primary text-white hover:bg-brand-dark"}`}>
                <FiCopy size={14} />
                {captionCopied === captionPreview.id ? "Copied! ✓" : "Copy"}
              </button>
              <button
                onClick={() => {
                  const { id, captionType } = captionPreview;
                  setCaptionPreview(null);
                  const prod = products.find((x) => x.id === id);
                  if (prod) handleGenerateCaption(prod, captionType, true);
                }}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-all">
                🔄 Redo
              </button>
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-3">
              {captionPreview.captionType === "whatsapp" && "For WhatsApp Status, Business, forwards"}
              {captionPreview.captionType === "instagram" && "For Instagram feed posts, reels caption, stories link"}
              {captionPreview.captionType === "alt" && "Paste in product image alt attribute for SEO"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
