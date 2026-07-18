"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar, FaWhatsapp, FaHeart, FaRegHeart, FaShareAlt } from "react-icons/fa";
import { FiEye } from "react-icons/fi";

interface Product {
  id: string; name: string; slug: string; brand: string; category: string;
  price: number; mrp: number; discount: number; images: string[];
  rating: number; reviews_count: number; in_stock: boolean;
  key_benefits?: string[]; suitable_for?: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map((s) => {
        if (s <= Math.floor(rating)) return <FaStar key={s} size={11} className="text-yellow-400" />;
        if (s === Math.ceil(rating) && rating % 1 >= 0.5) return <FaStarHalfAlt key={s} size={11} className="text-yellow-400" />;
        return <FaRegStar key={s} size={11} className="text-yellow-300" />;
      })}
    </div>
  );
}

export default function ProductCard({ p }: { p: Product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [copied, setCopied] = useState(false);

  const productUrl = `https://shreeambikabeautyshop.vercel.app/products/${p.slug || p.id}`;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    await navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const waMsg = encodeURIComponent(
    `Hi Vinod! I want to order:\n*${p.name}*\nPrice: Rs.${p.price}\n\n${productUrl}`
  );

  // Extract top 3 benefits
  const benefits = Array.isArray(p.key_benefits)
    ? p.key_benefits.slice(0, 3)
    : [];

  const benefitIcons = ["🔸", "⚡", "✦"];

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* ── IMAGE AREA ── */}
      <div className="relative bg-gradient-to-b from-[#fdf6ee] to-[#fef9f4] overflow-hidden" style={{ minHeight: "240px" }}>
        <Link href={`/products/${p.slug || p.id}`}>
          <div className="relative h-60">
            {p.images?.[0] ? (
              <Image
                src={p.images[0]}
                alt={p.name}
                fill
                className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">💄</div>
            )}
          </div>
        </Link>

        {/* Share + Wishlist — top right */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={handleShare}
            className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all border border-gray-100"
            title={copied ? "Copied!" : "Share"}
          >
            {copied
              ? <span className="text-green-500 text-[10px] font-bold">✓</span>
              : <FaShareAlt size={12} className="text-gray-500" />}
          </button>
          <button
            onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
            className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all border border-gray-100"
            title="Wishlist"
          >
            {wishlisted
              ? <FaHeart size={13} className="text-brand-primary" />
              : <FaRegHeart size={13} className="text-gray-400 hover:text-brand-primary transition-colors" />}
          </button>
        </div>

        {/* Discount badge — top left */}
        {p.discount > 0 && (
          <div className="absolute top-3 left-3">
            <span className="bg-brand-primary text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow">
              {p.discount}% OFF
            </span>
          </div>
        )}
      </div>

      {/* ── CARD BODY ── */}
      <div className="px-4 pt-3 pb-4 flex flex-col flex-1">

        {/* Category pill */}
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-brand-primary bg-brand-light px-2.5 py-1 rounded-full border border-brand-accent/30">
            🏷 {p.category}
          </span>
        </div>

        {/* Brand + Name */}
        <Link href={`/products/${p.slug || p.id}`}>
          <div className="mb-1.5">
            <p className="text-[11px] font-black text-gray-700 uppercase tracking-wide leading-none mb-0.5">{p.brand}</p>
            <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 hover:text-brand-primary transition-colors group-hover:text-brand-primary">
              {p.name}
            </h3>
          </div>
        </Link>

        {/* Stars + Reviews */}
        <div className="flex items-center gap-1.5 mb-3">
          <Stars rating={p.rating || 4.2} />
          <span className="text-xs font-semibold text-gray-700">{p.rating || 4.2}</span>
          <span className="text-[10px] text-gray-400">({p.reviews_count || 0} Reviews)</span>
        </div>

        {/* MRP / Price / In Stock */}
        <div className="flex items-end justify-between mb-3">
          <div>
            {p.mrp > p.price && (
              <p className="text-[10px] text-gray-400 font-medium">
                MRP <span className="line-through">₹{p.mrp.toLocaleString("en-IN")}</span>
              </p>
            )}
            <p className="text-xs text-gray-500 font-medium">Our Price</p>
            <p className="text-2xl font-black text-gray-900 leading-tight">
              <span className="text-base font-normal">₹</span>{p.price.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 text-xs font-semibold ${p.in_stock ? "text-green-600" : "text-red-500"}`}>
              <span className={`w-2 h-2 rounded-full ${p.in_stock ? "bg-green-500" : "bg-red-500"}`} />
              {p.in_stock ? "In Stock" : "Out of Stock"}
            </div>
            {p.in_stock && <p className="text-[10px] text-gray-400">Ready to Ship</p>}
          </div>
        </div>

        {/* Key benefits — 3 icons */}
        {benefits.length > 0 && (
          <div className="grid grid-cols-3 gap-1.5 mb-4 bg-gray-50 rounded-xl p-2">
            {benefits.map((b, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-0.5">
                <span className="text-base">{benefitIcons[i]}</span>
                <span className="text-[9px] text-gray-600 leading-tight line-clamp-2">{b}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/products/${p.slug || p.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-200 hover:border-brand-primary text-gray-700 hover:text-brand-primary text-xs font-semibold py-2.5 rounded-xl transition-all"
          >
            <FiEye size={13} /> View Details
          </Link>
          <a
            href={`https://wa.me/918291455297?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold py-2.5 rounded-xl transition-all hover:shadow-md"
          >
            <FaWhatsapp size={14} />
            <span>Buy on WhatsApp<br /><span className="text-[8px] opacity-80">Vinod: +91-8291455297</span></span>
          </a>
        </div>
      </div>
    </div>
  );
}
