"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { FaStar, FaStarHalfAlt, FaRegStar, FaWhatsapp, FaFire, FaHeart, FaRegHeart } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight, FiEye, FiPackage, FiTruck, FiShield } from "react-icons/fi";
import { useWishlist } from "@/app/context/WishlistContext";

interface Product {
  id: string; name: string; slug: string; brand: string; category: string;
  price: number; mrp: number; discount: number; images: string[];
  rating: number; reviews_count: number; in_stock: boolean;
  key_benefits?: string[];
}

function Stars({ rating, size = 11 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => {
        if (s <= Math.floor(rating)) return <FaStar key={s} size={size} className="text-yellow-400" />;
        if (s === Math.ceil(rating) && rating % 1 >= 0.5) return <FaStarHalfAlt key={s} size={size} className="text-yellow-400" />;
        return <FaRegStar key={s} size={size} className="text-yellow-300" />;
      })}
    </div>
  );
}

const TABS = ["All", "Hair Care", "Skin Care", "Makeup", "Cosmetics", "Perfumes", "Body Care"];
const LIST_SIZE = 6;

export default function BestsellerProducts() {
  const [products, setProducts]       = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeTab, setActiveTab]     = useState("All");
  const [page, setPage]               = useState(0);
  const [featured, setFeatured]       = useState<Product | null>(null);
  const [featuredImg, setFeaturedImg] = useState(0);
  const { toggle, has } = useWishlist();

  const pickFeatured = useCallback((list: Product[]) => {
    if (!list.length) return;
    const rand = list[Math.floor(Math.random() * Math.min(list.length, 8))];
    setFeatured(rand);
    setFeaturedImg(0);
  }, []);

  useEffect(() => {
    setLoading(true);
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    let query = supabase
      .from("products")
      .select("id,name,slug,brand,category,price,mrp,discount,images,rating,reviews_count,in_stock,key_benefits")
      .eq("in_stock", true)
      .order("created_at", { ascending: false })
      .limit(24);
    if (activeTab !== "All") query = query.eq("category", activeTab);
    query.then(({ data }) => {
      const list = data || [];
      setProducts(list);
      setPage(0);
      pickFeatured(list);
      setLoading(false);
    });
  }, [activeTab, pickFeatured]);

  const totalPages = Math.ceil(products.length / LIST_SIZE);
  const visible    = products.slice(page * LIST_SIZE, page * LIST_SIZE + LIST_SIZE);

  const waMsg = featured ? encodeURIComponent(
    `Hi Vinod! I want to order:\n\n*${featured.name}*\nBrand: ${featured.brand}\nPrice: ₹${featured.price}\n\nhttps://shreeambikabeautyshop.vercel.app/products/${featured.slug || featured.id}`
  ) : "";

  const benefits = featured?.key_benefits?.slice(0, 4) || [];

  return (
    <section className="py-12 bg-white" aria-labelledby="bestseller-heading">
      <div className="max-w-[1400px] mx-auto px-4">

        {/* ── Top bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <FaFire className="text-orange-500" size={18} />
            <h2 id="bestseller-heading" className="text-xl font-heading italic text-brand-primary">
              Bestseller Products
            </h2>
            <p className="text-xs text-gray-400 hidden sm:block">— Most loved by our customers</p>
          </div>
          <Link href="/products"
            className="text-sm font-semibold text-brand-primary border border-brand-primary/30 px-4 py-1.5 rounded-full hover:bg-brand-light transition-colors self-start sm:self-auto">
            View All Products →
          </Link>
        </div>

        {/* ── Category Tabs ── */}
        <div className="flex gap-2 flex-wrap mb-6">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === tab
                  ? "bg-brand-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-brand-light hover:text-brand-primary"
              }`}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── Three-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-0 rounded-3xl border border-gray-100 shadow-sm overflow-hidden bg-white">

          {/* ══ COL 1: Product Images ══ */}
          <div className="bg-brand-light flex flex-col relative">
            {loading || !featured ? (
              <div className="flex-1 min-h-[420px] animate-pulse bg-gray-200" />
            ) : (
              <>
                {/* Main image */}
                <div className="relative flex-1 min-h-[380px]">
                  {featured.images?.[featuredImg] ? (
                    <Image
                      src={featured.images[featuredImg]}
                      alt={featured.name}
                      fill
                      className="object-cover object-top"
                      sizes="220px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-7xl">💄</div>
                  )}
                  {(featured.discount ?? 0) > 0 && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                      {featured.discount}% OFF
                    </span>
                  )}
                  {/* Prev/Next image arrows */}
                  {(featured.images?.length ?? 0) > 1 && (
                    <>
                      <button onClick={() => setFeaturedImg((i) => Math.max(0, i - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-all z-10">
                        <FiChevronLeft size={14} />
                      </button>
                      <button onClick={() => setFeaturedImg((i) => Math.min((featured.images?.length ?? 1) - 1, i + 1))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition-all z-10">
                        <FiChevronRight size={14} />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {(featured.images?.length ?? 0) > 1 && (
                  <div className="flex gap-2 p-3 justify-center bg-white border-t border-gray-100">
                    {featured.images.slice(0, 4).map((img, i) => (
                      <button key={i} onClick={() => setFeaturedImg(i)}
                        className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                          i === featuredImg ? "border-brand-primary" : "border-gray-200 opacity-60 hover:opacity-100"
                        }`}>
                        <Image src={img} alt="" fill className="object-cover" sizes="48px" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* ══ COL 2: Product Details ══ */}
          <div className="p-6 flex flex-col justify-between border-x border-gray-100">
            {loading || !featured ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-1/4" />
                <div className="h-6 bg-gray-100 rounded w-4/5" />
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-8 bg-gray-100 rounded w-1/4" />
              </div>
            ) : (
              <>
                <div>
                  {/* Brand */}
                  <p className="text-[11px] font-black text-brand-primary uppercase tracking-widest mb-1">
                    {featured.brand}
                  </p>

                  {/* Name */}
                  <Link href={`/products/${featured.slug || featured.id}`}>
                    <h3 className="text-lg font-bold text-gray-900 font-serif leading-snug hover:text-brand-primary transition-colors mb-3">
                      {featured.name}
                    </h3>
                  </Link>

                  {/* Stars */}
                  <div className="flex items-center gap-2 mb-4">
                    <Stars rating={featured.rating || 4.2} size={13} />
                    <span className="text-xs font-bold text-gray-600">{featured.rating || 4.2}</span>
                    <span className="text-xs text-gray-400">({featured.reviews_count || 0} reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-5">
                    <span className="text-3xl font-black text-brand-primary">
                      ₹{featured.price.toLocaleString("en-IN")}
                    </span>
                    {featured.mrp > featured.price && (
                      <span className="text-sm text-gray-400 line-through">
                        ₹{featured.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {/* Key Benefits */}
                  {benefits.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs font-bold text-gray-700 mb-2">Key Benefits:</p>
                      <ul className="space-y-1.5">
                        {benefits.map((b, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-green-500 flex-shrink-0 mt-0.5">✓</span>
                            {b}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Trust badges */}
                  <div className="flex flex-wrap gap-3 mb-5">
                    {[
                      { icon: <FiPackage size={11} />, label: "100% Original" },
                      { icon: <FiTruck size={11} />, label: "Fast Delivery" },
                      { icon: <FiShield size={11} />, label: "Safe & Secure" },
                    ].map((b) => (
                      <span key={b.label} className="flex items-center gap-1.5 text-[11px] text-green-700 font-semibold">
                        {b.icon} {b.label}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTAs */}
                <div className="flex items-center gap-3 flex-wrap">
                  <a href={`https://wa.me/918291455297?text=${waMsg}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all text-sm min-w-[160px]">
                    <FaWhatsapp size={16} /> Buy on WhatsApp
                  </a>
                  <Link href={`/products/${featured.slug || featured.id}`}
                    className="flex items-center justify-center gap-2 border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-bold py-3 px-5 rounded-xl transition-all text-sm">
                    <FiEye size={14} /> Details
                  </Link>
                  <button
                    onClick={() => toggle({
                      id: featured.id, name: featured.name, slug: featured.slug,
                      brand: featured.brand, price: featured.price, mrp: featured.mrp,
                      images: featured.images, rating: featured.rating, category: featured.category,
                    })}
                    className="w-11 h-11 rounded-xl border-2 border-gray-200 hover:border-brand-primary flex items-center justify-center transition-all">
                    {has(featured.id)
                      ? <FaHeart size={16} className="text-brand-primary" />
                      : <FaRegHeart size={16} className="text-gray-400" />}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ══ COL 3: Bestseller List ══ */}
          <div className="flex flex-col">
            {/* Red header */}
            <div className="flex items-center justify-between bg-brand-primary text-white px-4 py-3">
              <div className="flex items-center gap-2">
                <FaFire size={14} className="text-orange-300" />
                <span className="font-bold text-sm">Bestseller Products</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                  className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center disabled:opacity-40 hover:bg-white/20 transition-all">
                  <FiChevronLeft size={13} />
                </button>
                <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                  className="w-7 h-7 rounded-full border border-white/30 flex items-center justify-center disabled:opacity-40 hover:bg-white/20 transition-all">
                  <FiChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* List items */}
            <div className="divide-y divide-gray-50 flex-1">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex gap-3 p-3 animate-pulse">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                : visible.map((p, idx) => (
                    <button key={p.id} onClick={() => { setFeatured(p); setFeaturedImg(0); }}
                      className={`w-full flex gap-3 p-3 text-left transition-all hover:bg-brand-light group ${
                        featured?.id === p.id ? "bg-pink-50 border-l-[3px] border-brand-primary" : "bg-white"
                      }`}>
                      {/* Rank badge + image */}
                      <div className="relative flex-shrink-0">
                        <div className="relative w-[60px] h-[60px] rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                          {p.images?.[0] ? (
                            <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="60px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">💄</div>
                          )}
                        </div>
                        {idx + page * LIST_SIZE < 3 && (
                          <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center text-white shadow ${
                            idx === 0 && page === 0 ? "bg-yellow-400"
                            : idx === 1 && page === 0 ? "bg-gray-400"
                            : "bg-orange-400"
                          }`}>
                            {idx + page * LIST_SIZE + 1}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 leading-snug line-clamp-2">{p.name}</p>
                        <Stars rating={p.rating || 4.2} size={9} />
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-sm font-black text-brand-primary">₹{p.price.toLocaleString("en-IN")}</span>
                          {p.mrp > p.price && (
                            <span className="text-[10px] text-gray-400 line-through">₹{p.mrp.toLocaleString("en-IN")}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
              }
            </div>

            {/* Page dots */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-1.5 py-3 bg-white border-t border-gray-50">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`rounded-full transition-all duration-300 ${i === page ? "bg-brand-primary w-5 h-2" : "bg-gray-300 w-2 h-2"}`} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
