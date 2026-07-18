"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight, FiShoppingCart } from "react-icons/fi";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { createClient } from "@supabase/supabase-js";

interface Product {
  id: string; name: string; slug: string; brand: string;
  price: number; mrp: number; discount: number;
  images: string[]; rating: number; reviews_count: number;
}

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  for (let i = 1; i <= 5; i++) {
    if (i <= full) stars.push(<FaStar key={i} size={11} className="text-yellow-400" />);
    else if (i === full + 1 && half) stars.push(<FaStarHalfAlt key={i} size={11} className="text-yellow-400" />);
    else stars.push(<FaRegStar key={i} size={11} className="text-yellow-300" />);
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export default function TrendingProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [startIdx, setStartIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const VISIBLE = 6;

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase
      .from("products")
      .select("id,name,slug,brand,price,mrp,discount,images,rating,reviews_count")
      .eq("in_stock", true)
      .eq("trending", true)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        // If no trending, fallback to latest
        if (!data || data.length === 0) {
          supabase
            .from("products")
            .select("id,name,slug,brand,price,mrp,discount,images,rating,reviews_count")
            .eq("in_stock", true)
            .order("created_at", { ascending: false })
            .limit(20)
            .then(({ data: fallback }) => setProducts(fallback || []));
        } else {
          setProducts(data);
        }
      });
  }, []);

  const canPrev = startIdx > 0;
  const canNext = startIdx + VISIBLE < products.length;

  const slide = (dir: "prev" | "next") => {
    if (isAnimating) return;
    setIsAnimating(true);
    setStartIdx((prev) => dir === "next"
      ? Math.min(prev + 1, products.length - VISIBLE)
      : Math.max(prev - 1, 0)
    );
    setTimeout(() => setIsAnimating(false), 300);
  };

  const visible = products.slice(startIdx, startIdx + VISIBLE);

  const waMsg = (p: Product) => encodeURIComponent(
    `Hi! I want to order:\n*${p.name}*\nPrice: Rs.${p.price}\n\nPlease confirm availability.`
  );

  return (
    <section className="py-10 bg-white" aria-labelledby="trending-heading">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* Header */}
        <div className="flex items-center justify-center gap-4 mb-7">
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

        {/* Slider */}
        <div className="relative">
          {/* Prev arrow */}
          <button
            onClick={() => slide("prev")}
            disabled={!canPrev}
            aria-label="Previous"
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <FiChevronLeft size={18} />
          </button>

          {/* Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 overflow-hidden">
            {visible.length === 0
              ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl bg-gray-50 animate-pulse h-72" />
              ))
              : visible.map((p) => (
                <div key={p.id}
                  className="group bg-white rounded-2xl border border-gray-100 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col overflow-hidden">

                  {/* Image area — tall, clean white bg */}
                  <Link href={`/products/${p.slug || p.id}`} className="relative block">
                    <div className="relative h-56 bg-gradient-to-b from-gray-50 to-white overflow-hidden rounded-t-2xl">
                      {p.images?.[0] ? (
                        <Image
                          src={p.images[0]}
                          alt={p.name}
                          fill
                          className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, 16vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">💄</div>
                      )}
                    </div>

                    {/* Discount pill — top right corner */}
                    {p.discount > 0 && (
                      <span className="absolute top-2.5 right-2.5 bg-brand-primary text-white text-[10px] font-black px-2 py-1 rounded-full shadow-sm">
                        {p.discount}% OFF
                      </span>
                    )}
                  </Link>

                  {/* Card body */}
                  <div className="p-3.5 flex flex-col flex-1 border-t border-gray-50">

                    {/* Brand */}
                    <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-1">
                      {p.brand}
                    </p>

                    {/* Product name */}
                    <Link href={`/products/${p.slug || p.id}`}>
                      <h3 className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 mb-2 hover:text-brand-primary transition-colors" style={{ minHeight: "2.6rem" }}>
                        {p.name}
                      </h3>
                    </Link>

                    {/* Stars + reviews */}
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded-full">
                        <StarRating rating={p.rating || 4.2} />
                      </div>
                      <span className="text-[10px] text-gray-400">{p.reviews_count || 0} reviews</span>
                    </div>

                    {/* Price block */}
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-base font-black text-gray-900">₹{p.price}</span>
                      {p.mrp > p.price && (
                        <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>
                      )}
                    </div>
                    {p.mrp > p.price && (
                      <p className="text-[10px] text-green-600 font-semibold mb-3">
                        You save ₹{p.mrp - p.price}!
                      </p>
                    )}

                    {/* CTA buttons */}
                    <div className="flex gap-2 mt-auto">
                      <a
                        href={`https://wa.me/918291455297?text=${waMsg(p)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold py-2.5 rounded-xl transition-all hover:shadow-md"
                      >
                        Add to Cart <FiShoppingCart size={11} />
                      </a>
                      <Link
                        href={`/products/${p.slug || p.id}`}
                        className="px-3 py-2.5 border border-brand-primary text-brand-primary rounded-xl text-xs font-semibold hover:bg-brand-light transition-colors"
                        title="View Details"
                      >
                        →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Next arrow */}
          <button
            onClick={() => slide("next")}
            disabled={!canNext}
            aria-label="Next"
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <FiChevronRight size={18} />
          </button>
        </div>

        {/* View All Button */}
        <div className="text-center mt-7">
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
