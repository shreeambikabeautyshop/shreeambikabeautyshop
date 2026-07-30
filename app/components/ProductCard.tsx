"use client";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { FaStar, FaWhatsapp } from "react-icons/fa";
import { FiEye, FiHeart } from "react-icons/fi";
import { useWhatsAppOrder } from "@/app/hooks/useWhatsAppOrder";
import { useWishlist } from "@/app/context/WishlistContext";
import { useSettings } from "@/app/context/SettingsContext";

export interface ProductCardData {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  price: number;
  mrp: number;
  discount: number;
  images: string[];
  rating?: number;
  reviews_count?: number;
  in_stock?: boolean;
  featured?: boolean;
  trending?: boolean;
  tags?: string[];
  video_url?: string;
}

interface Props {
  product: ProductCardData;
  source?: string; // for WhatsApp tracking: "home", "category_page", "occasion_page" etc.
}

export default function ProductCard({ product: p, source = "product_card" }: Props) {
  const { openWhatsApp } = useWhatsAppOrder();
  const { add, remove, has } = useWishlist();
  const { show_price, show_mrp } = useSettings();
  const inWishlist = has(p.id);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const handleOrder = () => {
    openWhatsApp({
      productId: p.id,
      productName: p.name,
      productBrand: p.brand,
      productPrice: p.price,
      source,
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      remove(p.id);
    } else {
      add({ id: p.id, name: p.name, price: p.price, mrp: p.mrp || p.price, images: p.images || [], slug: p.slug, brand: p.brand, rating: p.rating || 4.2, category: p.category });
    }
  };

  const handleMouseEnter = () => {
    if (p.video_url) {
      setIsHovered(true);
      videoRef.current?.play().catch(() => {/* autoplay blocked silently */});
    }
  };

  const handleMouseLeave = () => {
    if (p.video_url) {
      setIsHovered(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted((prev) => !prev);
  };

  const rating = p.rating || 4.2;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image / Video area */}
      <div
        className="relative overflow-hidden bg-gray-50"
        style={{ aspectRatio: "3/4" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Static image — hidden when video is playing */}
        <Link href={`/products/${p.slug || p.id}`} tabIndex={isHovered && !!p.video_url ? -1 : 0}>
          {p.images?.[0] ? (
            <Image
              src={p.images[0]}
              alt={`Buy ${p.name} by ${p.brand} - ${p.category} - Rs.${p.price} at Shree Ambika Beauty Shop Dahisar Mumbai | 100% Original`}
              fill
              className={`object-cover object-top transition-all duration-500 ${
                isHovered && p.video_url ? "opacity-0 scale-105" : "opacity-100 group-hover:scale-105"
              }`}
              sizes="(max-width: 640px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">💄</div>
          )}
        </Link>

        {/* Video — always in DOM if video_url exists, plays on hover */}
        {p.video_url && (
          <video
            ref={videoRef}
            src={p.video_url}
            muted={isMuted}
            loop
            playsInline
            preload="metadata"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-label={`${p.name} product video`}
          />
        )}

        {/* Video badge + mute toggle — show when video is playing */}
        {p.video_url && isHovered && (
          <button
            onClick={handleToggleMute}
            className="absolute bottom-8 left-2 z-10 flex items-center gap-1 bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded-full transition-colors"
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? "🔇 Tap for sound" : "🔊 Sound on"}
          </button>
        )}

        {/* Video indicator on image (before hover) */}
        {p.video_url && !isHovered && (
          <span className="absolute bottom-8 left-2 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-1">
            ▶ Video
          </span>
        )}

        {/* Badges — trending/featured only */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {p.trending && (
            <span className="bg-brand-primary text-white text-[9px] font-black px-2 py-0.5 rounded-full">🔥 TRENDING</span>
          )}
          {p.featured && !p.trending && (
            <span className="bg-yellow-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full">⭐ FEATURED</span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all ${
            inWishlist ? "bg-brand-primary text-white" : "bg-white/90 text-gray-400 hover:text-brand-primary"
          }`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <FiHeart size={13} className={inWishlist ? "fill-current" : ""} />
        </button>

        {/* Category badge */}
        <span className="absolute bottom-2 right-2 bg-white/90 text-brand-primary text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
          {p.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        {/* Brand */}
        <p className="text-[10px] font-black text-brand-primary uppercase tracking-wider mb-0.5">{p.brand}</p>

        {/* Name */}
        <Link href={`/products/${p.slug || p.id}`}>
          <h3 className="text-xs font-semibold text-gray-800 leading-snug mb-1.5 line-clamp-2 hover:text-brand-primary transition-colors">
            {p.name}
          </h3>
        </Link>

        {/* Stars + stock */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(s => (
              <FaStar key={s} size={9} className={s <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"} />
            ))}
            <span className="text-[9px] text-gray-400 ml-0.5">({p.reviews_count || 0})</span>
          </div>
          <span className={`text-[9px] font-bold ${p.in_stock !== false ? "text-green-600" : "text-red-500"}`}>
            {p.in_stock !== false ? "● In Stock" : "● Out of Stock"}
          </span>
        </div>

        {/* Price */}
        <div className="mb-2.5">
          {show_price && p.price && p.price > 0 ? (
            <div className="flex items-center gap-1.5">
              <span className="font-black text-gray-900 text-sm">₹{p.price}</span>
              {show_mrp && p.mrp > p.price && (
                <span className="text-[10px] text-gray-400 line-through">₹{p.mrp}</span>
              )}
            </div>
          ) : !show_price ? (
            <span className="text-xs font-semibold text-gray-500 italic">Contact for Price</span>
          ) : (
            <span className="text-xs font-semibold text-gray-500 italic">Contact for Price</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-1.5 mt-auto">
          <Link
            href={`/products/${p.slug || p.id}`}
            className="flex items-center justify-center gap-1 flex-1 border border-gray-200 hover:border-brand-primary text-gray-600 hover:text-brand-primary text-[10px] font-bold py-2 rounded-xl transition-all"
          >
            <FiEye size={11} /> View Details
          </Link>
          <button
            onClick={handleOrder}
            className="flex items-center justify-center gap-1 flex-1 bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold py-2 rounded-xl transition-colors"
          >
            <FaWhatsapp size={11} /> Buy on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
