"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiX, FiStar, FiShoppingCart, FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

interface Product {
  id: string; name: string; slug: string; brand: string; category: string;
  price: number; mrp: number; discount: number; images: string[];
  rating: number; in_stock: boolean; description: string;
}

const PER_PAGE = 15; // 5 rows × 3 columns

export default function AIRecommender() {
  const [concern, setConcern] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [found, setFound] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(products.length / PER_PAGE);
  const paginated = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSubmit = async () => {
    if (!concern.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/recommend-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concern: concern.trim() }),
      });
      const data = await res.json();
      setProducts(data.products || []);
      setKeywords(data.keywords || []);
      setFound(data.found);
      setShowModal(true);
      setPage(1);
    } catch {
      setShowModal(true);
      setFound(false);
    } finally {
      setLoading(false);
    }
  };

  const waOrderMsg = (p: Product) => {
    const url = `https://shreeambikabeautyshop.vercel.app/products/${p.slug || p.id}`;
    return encodeURIComponent(
      `Hi! I want to order:\n*${p.name}*\nPrice: Rs.${p.price}\n\nProduct link: ${url}\n\nMy concern: ${concern}`
    );
  };

  const waNotFoundMsg = encodeURIComponent(
    `Hi! I need help finding beauty products for: "${concern}"\n\nI couldn't find exact products online. Can you help me find the right product? I need expert guidance.\n\nThank you!`
  );

  return (
    <>
      {/* ── SECTION ── */}
      <section
        className="relative overflow-hidden py-5"
        style={{ background: "linear-gradient(135deg, #fff0f3 0%, #ffe4ec 40%, #fff0f3 100%)" }}
        aria-label="AI Beauty Product Recommender"
      >
        {/* Flowers left */}
        <div className="absolute left-0 top-0 bottom-0 w-28 opacity-60 pointer-events-none select-none">
          <div className="absolute top-0 left-0 text-5xl rotate-[-20deg] translate-x-[-10px] translate-y-[-5px]">🌸</div>
          <div className="absolute top-6 left-6 text-3xl rotate-[10deg]">🌺</div>
          <div className="absolute bottom-2 left-2 text-4xl rotate-[-10deg]">🌸</div>
          <div className="absolute bottom-8 left-10 text-2xl rotate-[20deg]">🌼</div>
          <div className="absolute top-1/2 left-0 text-3xl rotate-[-5deg]">🌸</div>
        </div>
        {/* Flowers right */}
        <div className="absolute right-0 top-0 bottom-0 w-28 opacity-60 pointer-events-none select-none">
          <div className="absolute top-0 right-2 text-5xl rotate-[20deg] translate-y-[-5px]">🌸</div>
          <div className="absolute top-6 right-8 text-3xl rotate-[-10deg]">🌺</div>
          <div className="absolute bottom-2 right-2 text-4xl rotate-[10deg]">🌸</div>
          <div className="absolute bottom-8 right-10 text-2xl rotate-[-20deg]">🌼</div>
          <div className="absolute top-1/2 right-0 text-3xl rotate-[5deg]">🌸</div>
        </div>

        <div className="w-full px-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">

            {/* LEFT — Robot + Text — equal flex */}
            <div className="flex items-center gap-5 flex-1">
              {/* Robot image */}
              <div className="relative w-28 h-28 flex-shrink-0 drop-shadow-lg">
                <Image
                  src="https://res.cloudinary.com/zjlchjal/image/upload/v1784216154/AI-model_q5uqog.png"
                  alt="AI Beauty Bot"
                  fill
                  className="object-contain"
                />
              </div>
              {/* Text */}
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none mb-0.5">AI POWERED</p>
                <h2 className="text-xl font-black text-brand-primary leading-tight">SMART PRODUCT<br />RECOMMENDER</h2>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-[220px]">
                  Tell us your beauty issue and get the perfect product recommendations for you! ✨
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-20 bg-pink-200 flex-shrink-0" />

            {/* RIGHT — Input — equal flex */}
            <div className="flex-1 w-full">
              <p className="text-base font-bold text-brand-primary mb-3">What is your beauty concern?</p>
              <input
                type="text"
                value={concern}
                onChange={(e) => setConcern(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="E.g. Acne, Hair Fall, Dark Spots, Dry Skin..."
                className="w-full border border-pink-200 rounded-full px-5 py-3 text-sm outline-none focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(196,30,58,0.08)] transition-all bg-white mb-3"
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !concern.trim()}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full transition-all text-sm"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Finding best products...</>
                  : <>Get My Recommendations ✨</>}
              </button>
              <p className="text-center text-xs text-brand-primary mt-2 font-medium">
                ♥ 100% Personalised • Smart • Trusted ♥
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {found ? "✨ Recommended for you" : "🔍 No exact match found"}
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  Based on: <span className="text-brand-primary font-medium">&ldquo;{concern}&rdquo;</span>
                  {keywords.length > 0 && (
                    <span className="ml-2 text-xs text-gray-300">
                      • keywords: {keywords.join(", ")}
                    </span>
                  )}
                </p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            <div className="px-6 py-5">
              {found ? (
                <>
                  {/* Products Grid — 3 per row, 5 rows = 15 per page */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {paginated.map((p) => (
                      <div key={p.id} className="border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                        {/* Image */}
                        <div className="relative h-44 bg-brand-light">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-5xl">💄</div>
                          )}
                          {p.discount > 0 && (
                            <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {p.discount}% OFF
                            </span>
                          )}
                        </div>
                        {/* Info */}
                        <div className="p-3">
                          <p className="text-[10px] font-bold text-brand-primary uppercase mb-0.5">{p.brand}</p>
                          <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1.5">{p.name}</h4>
                          {p.rating > 0 && (
                            <div className="flex items-center gap-1 mb-2">
                              <FiStar size={10} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-[10px] text-gray-400">{p.rating}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mb-3">
                            <span className="font-bold text-sm text-gray-900">₹{p.price}</span>
                            {p.mrp > p.price && <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>}
                          </div>
                          <div className="flex gap-1.5">
                            <Link href={`/products/${p.slug || p.id}`}
                              onClick={() => setShowModal(false)}
                              className="flex-1 text-center text-xs bg-brand-light text-brand-primary font-semibold py-2 rounded-lg hover:bg-pink-100 transition-colors">
                              View
                            </Link>
                            <a href={`https://wa.me/918291455297?text=${waOrderMsg(p)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-center gap-1 text-xs bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition-colors">
                              <FaWhatsapp size={11} /> Order
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mb-5 px-1">
                      <p className="text-xs text-gray-400">
                        Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, products.length)} of {products.length} products
                      </p>
                      <div className="flex items-center gap-1.5">
                        {/* Prev */}
                        <button
                          onClick={() => { setPage(p => Math.max(1, p - 1)); }}
                          disabled={page === 1}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-brand-light hover:border-brand-accent hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold"
                        >
                          ‹
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                          const isActive = num === page;
                          const showPage = num === 1 || num === totalPages || Math.abs(num - page) <= 1;
                          const showDots = !showPage && (num === 2 || num === totalPages - 1);
                          if (showDots) return <span key={num} className="text-gray-300 text-xs px-1">…</span>;
                          if (!showPage) return null;
                          return (
                            <button
                              key={num}
                              onClick={() => setPage(num)}
                              className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                                isActive
                                  ? "bg-brand-primary text-white shadow-sm"
                                  : "border border-gray-200 text-gray-600 hover:bg-brand-light hover:border-brand-accent hover:text-brand-primary"
                              }`}
                            >
                              {num}
                            </button>
                          );
                        })}

                        {/* Next */}
                        <button
                          onClick={() => { setPage(p => Math.min(totalPages, p + 1)); }}
                          disabled={page === totalPages}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-brand-light hover:border-brand-accent hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-bold"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-center text-xs text-gray-400 mb-4">
                    Not satisfied? Our expert can help you find the perfect product.
                  </p>
                </>
              ) : (
                /* Not found */
                <div className="text-center py-6 mb-4">
                  <div className="text-5xl mb-4">🔍</div>
                  <h4 className="text-lg font-bold text-gray-700 mb-2">
                    We&apos;re searching for &ldquo;{concern}&rdquo;
                  </h4>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    This specific product may not be listed online yet, but our experts can arrange it for you instantly!
                  </p>
                </div>
              )}

              {/* WhatsApp CTA */}
              <div className="bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="text-white flex-1">
                    <p className="font-bold text-base mb-1">
                      {found ? "Need expert guidance?" : "Contact our Sales Expert!"}
                    </p>
                    <p className="text-white/80 text-xs leading-relaxed">
                      {found
                        ? "Not sure which product is right for you? WhatsApp Vinod — get instant personalised advice."
                        : "We can arrange any beauty product for you instantly! Contact our sales expert on WhatsApp for instant expert guidance & arrangement."}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/918291455297?text=${waNotFoundMsg}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-2 bg-white text-brand-primary font-bold px-5 py-3 rounded-full hover:bg-brand-light transition-colors text-sm whitespace-nowrap"
                  >
                    <FaWhatsapp size={18} className="text-green-500" />
                    Chat with Expert
                  </a>
                </div>

                {/* Physical store */}
                <div className="mt-4 pt-4 border-t border-white/20 flex items-start gap-2">
                  <FiMapPin size={14} className="text-white/70 flex-shrink-0 mt-0.5" />
                  <p className="text-white/70 text-xs leading-relaxed">
                    <span className="font-bold text-white">Also visit us in-store!</span> If you&apos;re in Mumbai, come to Shree Ambika Beauty Shop — try products personally & get expert advice. Call before visiting: <a href="tel:+918291455297" className="underline text-white">+918291455297</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
