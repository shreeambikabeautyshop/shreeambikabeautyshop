"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { createClient } from "@supabase/supabase-js";
import ProductCard from "./ProductCard";

interface Product {
  id: string; name: string; slug: string; brand: string; category: string;
  price: number; mrp: number; discount: number; images: string[];
  rating: number; reviews_count: number; in_stock: boolean;
  key_benefits?: string[]; suitable_for?: string;
}

export default function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const PER_PAGE = 4;

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase
      .from("products")
      .select("id,name,slug,brand,category,price,mrp,discount,images,rating,reviews_count,in_stock,key_benefits,suitable_for")
      .eq("in_stock", true)
      .eq("trending", true)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!data || data.length === 0) {
          supabase
            .from("products")
            .select("id,name,slug,brand,category,price,mrp,discount,images,rating,reviews_count,in_stock,key_benefits,suitable_for")
            .eq("in_stock", true)
            .order("created_at", { ascending: false })
            .limit(20)
            .then(({ data: fallback }) => setProducts(fallback || []));
        } else {
          setProducts(data);
        }
      });
  }, []);

  const totalPages = Math.ceil(products.length / PER_PAGE);
  const visible = products.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section className="py-10 bg-white" aria-labelledby="trending-heading">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-brand-primary/30" />
            <span className="text-brand-primary/50 text-sm">❧</span>
          </div>
          <h2 id="trending-heading" className="text-base font-bold tracking-[0.3em] uppercase text-brand-primary">
            TRENDING PRODUCTS
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-brand-primary/50 text-sm">❧</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-brand-primary/30" />
          </div>
        </div>

        {/* 4 cards per row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {visible.length === 0
            ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-gray-50 animate-pulse h-[520px]" />
            ))
            : visible.map((p) => <ProductCard key={p.id} p={p} />)
          }
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mb-6">
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

        {/* View All */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 border-2 border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white font-semibold px-10 py-2.5 rounded-full transition-all text-sm"
          >
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}
