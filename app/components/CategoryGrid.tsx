"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ProductCard from "./ProductCard";

interface Product {
  id: string; name: string; slug: string; brand: string; category: string;
  price: number; mrp: number; discount: number; images: string[];
  rating: number; reviews_count: number; in_stock: boolean;
  key_benefits?: string[]; suitable_for?: string;
}

const categories = [
  { name: "Cosmetics",        icon: "💄", slug: "cosmetics",       bg: "from-pink-100 to-rose-50",       desc: "Lipsticks, Foundation, Compact, Kajal, Nail Care & More" },
  { name: "Makeup",           icon: "🎨", slug: "makeup",          bg: "from-purple-100 to-pink-50",     desc: "Makeup Kits, Brushes, Sponges, Eyeliner & More" },
  { name: "Skin Care",        icon: "✨", slug: "skincare",         bg: "from-green-50 to-emerald-50",    desc: "Cleansers, Serums, Moisturizers, Sunscreen & More" },
  { name: "Hair Care",        icon: "💆", slug: "haircare",         bg: "from-yellow-50 to-amber-50",     desc: "Shampoo, Conditioner, Hair Oil, Hair Mask & More" },
  { name: "Body Care",        icon: "🧴", slug: "bodycare",         bg: "from-blue-50 to-cyan-50",        desc: "Lotions, Body Wash, Scrub, Deodorant & More" },
  { name: "Perfumes",         icon: "🌸", slug: "perfumes",         bg: "from-rose-100 to-pink-50",       desc: "Luxury, Premium & Long Lasting Scents" },
  { name: "Electronics",      icon: "💅", slug: "electronics",      bg: "from-slate-100 to-gray-50",      desc: "Hair Dryer, Straightener, Trimmer, Steamer & More" },
  { name: "Purses & Bags",    icon: "👜", slug: "purses-bags",      bg: "from-orange-50 to-amber-50",     desc: "Stylish Purses, Clutches, Wallets & More" },
  { name: "Wax & Accessories",icon: "🪮", slug: "wax-accessories",  bg: "from-indigo-50 to-purple-50",    desc: "Waxing, Strips, Accessories & More" },
];

const PER_PAGE = 4;

export default function CategoryGrid() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const activeCategory = categories[activeIndex];

  // On mount: find the first category that has products and auto-select it
  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const findFirstWithProducts = async () => {
      for (let i = 0; i < categories.length; i++) {
        const { data } = await supabase
          .from("products")
          .select("id,name,slug,brand,category,price,mrp,discount,images,rating,reviews_count,in_stock,key_benefits,suitable_for")
          .eq("category", categories[i].name)
          .eq("in_stock", true)
          .order("created_at", { ascending: false })
          .limit(20);
        if (data && data.length > 0) {
          setActiveIndex(i);
          setProducts(data);
          setLoading(false);
          setInitialized(true);
          return;
        }
      }
      setLoading(false);
      setInitialized(true);
    };

    findFirstWithProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When user manually clicks a tab (after init)
  useEffect(() => {
    if (!initialized) return;
    setLoading(true);
    setPage(0);
    setProducts([]);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase
      .from("products")
      .select("id,name,slug,brand,category,price,mrp,discount,images,rating,reviews_count,in_stock,key_benefits,suitable_for")
      .eq("category", activeCategory.name)
      .eq("in_stock", true)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setProducts(data || []);
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const totalPages = Math.ceil(products.length / PER_PAGE);
  const visible = products.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section className="py-10 px-4 max-w-[1400px] mx-auto" aria-labelledby="category-heading">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <h2 id="category-heading" className="text-2xl md:text-3xl font-bold text-brand-primary font-serif">
          Shop By Category
        </h2>
        <Link href={`/categories/${activeCategory.slug}`}
          className="text-sm font-semibold text-brand-secondary hover:underline whitespace-nowrap">
          View All →
        </Link>
      </div>

      {/* ── Product Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl bg-gray-50 animate-pulse h-[520px]" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {visible.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mb-8">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary disabled:opacity-30 transition-all"
              >
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === page ? "bg-brand-primary w-6" : "bg-gray-300 w-2.5 hover:bg-gray-400"
                  }`}
                />
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary disabled:opacity-30 transition-all"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : null}

      {/* ── Category Tabs ── */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-3 mt-8">
        {categories.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => setActiveIndex(i)}
            className={`group flex flex-col items-center text-center p-3 rounded-2xl bg-gradient-to-b ${cat.bg}
              transition-all duration-300 border-2
              ${i === activeIndex
                ? "border-brand-primary shadow-lg -translate-y-1 scale-[1.04]"
                : "border-white hover:shadow-md hover:-translate-y-0.5"
              }`}
            aria-pressed={i === activeIndex}
          >
            <p className={`text-xs font-bold leading-tight ${i === activeIndex ? "text-brand-primary" : "text-gray-800"}`}>
              {cat.name}
            </p>
            <p className="text-[9px] text-gray-500 mt-0.5 leading-tight hidden md:block">{cat.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
