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

  const benefits = Array.isArray(p.key_benefits) ? p.key_benefits.slice(0, 3) : [];
  const benefitIcons = ["🔸", "⚡", "✦"];

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* ── IMAGE AREA — full width, no badge ── */}
      <div className="relative w-full overflow-hidden rounded-t-3xl bg-gradient-to-b from-[#fdf6ee] to-[#fef9f4]">
        <Link href={`/products/${p.slug || p.id}`} className="block">
          <div className="relative w-full" style={{ aspectRatio: "4/3" }}>
            {p.images?.[0] ? (
              <Image
                src={p.images[0]}
                alt={p.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">💄</div>
            )}
          </div>
        </Link>

        {/* Share + Wishlist — top right */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          <button onClick={handleShare}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all border border-gray-100"
            title={copied ? "Copied!" : "Share"}>
            {copied
              ? <span className="text-green-500 text-[10px] font-bold">✓</span>
              : <FaShareAlt size={11} className="text-gray-500" />}
          </button>
          <button onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-all border border-gray-100"
            title="Wishlist">
            {wishlisted
              ? <FaHeart size={12} className="text-brand-primary" />
              : <FaRegHeart size={12} className="text-gray-400 hover:text-brand-primary transition-colors" />}
          </button>
        </div>
      </div>

      {/* ── CARD BODY — compact & structured ── */}
      <div className="px-3.5 pt-3 pb-3.5 flex flex-col gap-2">

        {/* Row 1: Brand (left) + Category pill (right) */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-black text-gray-700 uppercase tracking-wide leading-none truncate flex-1">
            {p.brand}
          </p>
          <span className="flex-shrink-0 text-[9px] font-semibold text-brand-primary bg-brand-light px-2 py-0.5 rounded-full border border-brand-accent/30 whitespace-nowrap">
            🏷 {p.category}
          </span>
        </div>

        {/* Row 2: Product title — full width, 2 lines */}
        <Link href={`/products/${p.slug || p.id}`}>
          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 hover:text-brand-primary transition-colors">
            {p.name}
          </h3>
        </Link>

        {/* Row 3: Stars (left) + Stock status (right) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Stars rating={p.rating || 4.2} />
            <span className="text-xs font-semibold text-gray-600">{p.rating || 4.2}</span>
            <span className="text-[10px] text-gray-400">({p.reviews_count || 0})</span>
          </div>
          <div className={`flex items-center gap-1 text-[10px] font-semibold ${p.in_stock ? "text-green-600" : "text-red-500"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${p.in_stock ? "bg-green-500" : "bg-red-500"}`} />
            {p.in_stock ? "In Stock" : "Out of Stock"}
          </div>
        </div>

        {/* Row 4: Selling price (left) + MRP (right) */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-gray-900 leading-none">
              ₹{p.price.toLocaleString("en-IN")}
            </span>
            {p.discount > 0 && (
              <span className="text-[10px] font-bold text-green-600">{p.discount}% off</span>
            )}
          </div>
          {p.mrp > p.price && (
            <div className="text-right">
              <p className="text-[9px] text-gray-400">MRP</p>
              <p className="text-xs text-gray-400 line-through">₹{p.mrp.toLocaleString("en-IN")}</p>
            </div>
          )}
        </div>

        {/* Benefits row — only if available */}
        {benefits.length > 0 && (
          <div className="grid grid-cols-3 gap-1 bg-gray-50 rounded-xl p-2">
            {benefits.map((b, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-0.5">
                <span className="text-sm">{benefitIcons[i]}</span>
                <span className="text-[9px] text-gray-500 leading-tight line-clamp-2">{b}</span>
              </div>
            ))}
          </div>
        )}

        {/* Row 5: View Details (left) + Buy on WhatsApp (right) — same row */}
        <div className="flex gap-2 pt-1">
          <Link href={`/products/${p.slug || p.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-200 hover:border-brand-primary text-gray-600 hover:text-brand-primary text-[11px] font-semibold py-2.5 rounded-xl transition-all whitespace-nowrap">
            <FiEye size={12} /> View Details
          </Link>
          <a href={`https://wa.me/918291455297?text=${waMsg}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex flex-col items-center justify-center bg-brand-primary hover:bg-brand-dark text-white py-2 rounded-xl transition-all hover:shadow-md">
            <div className="flex items-center gap-1">
              <FaWhatsapp size={13} />
              <span className="text-[11px] font-black">Buy on WhatsApp</span>
            </div>
            <span className="text-[8px] opacity-75">Vinod: +91-8291455297</span>
          </a>
        </div>
      </div>
    </div>
  );
}
