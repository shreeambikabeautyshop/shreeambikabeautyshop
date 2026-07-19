"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { FaStar, FaStarHalfAlt, FaRegStar, FaWhatsapp, FaFire } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Product {
  id: string; name: string; slug: string; brand: string; category: string;
  price: number; mrp: number; discount: number; images: string[];
  rating: number; reviews_count: number; in_stock: boolean;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => {
        if (s <= Math.floor(rating)) return <FaStar key={s} size={10} className="text-yellow-400" />;
        if (s === Math.ceil(rating) && rating % 1 >= 0.5) return <FaStarHalfAlt key={s} size={10} className="text-yellow-400" />;
        return <FaRegStar key={s} size={10} className="text-yellow-300" />;
      })}
    </div>
  );
}

const TABS = ["All", "Skin Care", "Hair Care", "Makeup", "Cosmetics", "Perfumes"];

export default function BestsellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(0);
  const PER_PAGE = 6;

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    let query = supabase
      .from("products")
      .select("id,name,slug,brand,category,price,mrp,discount,images,rating,reviews_count,in_stock")
      .eq("in_stock", true)
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(24);

    if (activeTab !== "All") {
      query = query.eq("category", activeTab);
    }

    query.then(({ data }) => {
      setProducts(data || []);
      setPage(0);
      setLoading(false);
    });
  }, [activeTab]);

  const totalPages = Math.ceil(products.length / PER_PAGE);
  const visible = products.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section className="py-12 bg-white" aria-labelledby="bestseller-heading">
      <div className="max-w-[1400px] mx-auto px-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-brand-primary rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <FaFire className="text-orange-500" size={18} />
                <h2 id="bestseller-heading" className="text-2xl font-heading italic text-brand-primary">
                  Bestseller Products
                </h2>
              </div>
              <p className="text-xs text-gray-400 font-sans mt-0.5">Most loved by our customers</p>
            </div>
          </div>
          <Link href="/products"
            className="text-sm font-semibold text-brand-primary border border-brand-primary/30 px-4 py-1.5 rounded-full hover:bg-brand-light transition-colors whitespace-nowrap">
            View All Products →
          </Link>
        </div>

        {/* Category Tabs */}
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

        {/* Products List */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-2xl bg-gray-50 animate-pulse">
                <div className="w-20 h-20 rounded-xl bg-gray-200 flex-shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">🛍️</p>
            <p className="text-sm">No products in this category yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((p, idx) => {
              const waMsg = encodeURIComponent(
                `Hi Vinod! I want to order:\n\n*${p.name}*\nBrand: ${p.brand}\nPrice: ₹${p.price}\n\nhttps://shreeambikabeautyshop.vercel.app/products/${p.slug || p.id}`
              );
              return (
                <div key={p.id}
                  className="group flex gap-4 p-3 rounded-2xl border border-gray-100 hover:border-brand-accent hover:shadow-md transition-all duration-200 bg-white">

                  {/* Rank badge */}
                  <div className="flex-shrink-0 relative">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-brand-light">
                      {p.images?.[0] ? (
                        <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="80px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">💄</div>
                      )}
                    </div>
                    {idx < 3 && (
                      <span className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center text-white shadow ${
                        idx === 0 ? "bg-yellow-400" : idx === 1 ? "bg-gray-400" : "bg-orange-400"
                      }`}>
                        {idx + 1 + page * PER_PAGE}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-wide truncate">{p.brand}</p>
                    <Link href={`/products/${p.slug || p.id}`}>
                      <h3 className="text-sm font-bold text-gray-800 leading-snug line-clamp-2 hover:text-brand-primary transition-colors mt-0.5">
                        {p.name}
                      </h3>
                    </Link>

                    <div className="flex items-center gap-1.5 mt-1">
                      <Stars rating={p.rating || 4.2} />
                      <span className="text-[10px] text-gray-400">({p.reviews_count || 0})</span>
                    </div>

                    <div className="flex items-center justify-between mt-1.5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-gray-900">₹{p.price.toLocaleString("en-IN")}</span>
                        {p.mrp > p.price && (
                          <span className="text-xs text-gray-400 line-through">₹{p.mrp.toLocaleString("en-IN")}</span>
                        )}
                        {(p.discount ?? 0) > 0 && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                            {p.discount}% OFF
                          </span>
                        )}
                      </div>

                      {/* WhatsApp buy */}
                      <a href={`https://wa.me/918291455297?text=${waMsg}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full transition-colors shadow-sm">
                        <FaWhatsapp size={11} /> Buy
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary disabled:opacity-30 transition-all">
              <FiChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${i === page ? "bg-brand-primary w-6" : "bg-gray-300 w-2.5 hover:bg-gray-400"}`} />
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary disabled:opacity-30 transition-all">
              <FiChevronRight size={16} />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
