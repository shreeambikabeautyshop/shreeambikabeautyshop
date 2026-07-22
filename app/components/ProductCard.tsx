"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar, FaWhatsapp, FaHeart, FaRegHeart, FaShareAlt, FaFacebook, FaTwitter, FaTelegram } from "react-icons/fa";
import { FiEye, FiCopy, FiX } from "react-icons/fi";
import { useWishlist } from "@/app/context/WishlistContext";
import { useUser } from "@/app/context/UserContext";
import WishlistToast from "./WishlistToast";
import { SiInstagram } from "react-icons/si";
import { useSettings } from "@/app/context/SettingsContext";
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
  const { toggle, has } = useWishlist();
  const { customer, isLoggedIn, triggerLogin } = useUser();
  const { show_price, show_mrp } = useSettings();
  const wishlisted = has(p.id);
  const [showShare, setShowShare]   = useState(false);
  const [copied, setCopied]         = useState(false);
  const [shortUrl, setShortUrl]     = useState<string | null>(null);
  const [shortLoading, setShortLoading] = useState(false);
  const [toast, setToast] = useState<{ name: string; image?: string; added: boolean } | null>(null);

  const shareRef = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const handler = (e: MouseEvent) => {
      if (!node.contains(e.target as Node)) setShowShare(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const productUrl = `https://www.shreeambikabeauty.com/products/${p.slug || p.id}`;

  // Get or create short URL on first share popup open
  const handleOpenShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShare(!showShare);
    if (!shortUrl && !shortLoading) {
      setShortLoading(true);
      try {
        const res = await fetch("/api/shorten", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: p.id, product_slug: p.slug || p.id, product_name: p.name }),
        });
        const json = await res.json();
        if (json.short_url) setShortUrl(json.short_url);
      } catch { /* fallback to full URL */ }
      setShortLoading(false);
    }
  };

  // Share URL — use short if available, fallback to full
  const shareLink = shortUrl || productUrl;

  const shareMsg = encodeURIComponent(
    `✨ Check out this amazing product!\n\n*${p.name}*\nBrand: ${p.brand}\nPrice: ₹${p.price}\n\n🛍️ Buy from Shree Ambika Beauty Shop, Mumbai\n📱 WhatsApp Vinod: +91-8291455297\n\n👉 ${shareLink}`
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: <FaWhatsapp size={18} />,
      color: "bg-green-500 hover:bg-green-600",
      url: `https://wa.me/?text=${shareMsg}`,
    },
    {
      name: "Facebook",
      icon: <FaFacebook size={18} />,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
    },
    {
      name: "Twitter",
      icon: <FaTwitter size={18} />,
      color: "bg-sky-500 hover:bg-sky-600",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`✨ ${p.name} | ₹${p.price} | Shree Ambika Beauty Shop Mumbai`)}&url=${encodeURIComponent(shareLink)}`,
    },
    {
      name: "Telegram",
      icon: <FaTelegram size={18} />,
      color: "bg-blue-500 hover:bg-blue-600",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${shareMsg}`,
    },
  ];

  const waMsg = customer
    ? encodeURIComponent(
        `Hi Vinod! I want to order:\n\n*Product:* ${p.name}\n*Brand:* ${p.brand}\n*Price:* ₹${p.price}\n\n*My Details:*\nName: ${customer.full_name}\nPhone: +91${customer.phone}\nAddress: ${customer.address}${customer.city ? `, ${customer.city}` : ""}${customer.state ? `, ${customer.state}` : ""}${customer.pincode ? ` - ${customer.pincode}` : ""}\n\n${productUrl}`
      )
    : encodeURIComponent(
        `Hi Vinod! I want to order:\n*${p.name}*\nPrice: Rs.${p.price}\n\n${productUrl}`
      );

  const benefits = Array.isArray(p.key_benefits) ? p.key_benefits.slice(0, 3) : [];
  const benefitIcons = ["🔸", "⚡", "✦"];

  return (
    <>
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* ── IMAGE AREA — full width, taller, no top cut ── */}
      <div className="relative w-full overflow-hidden rounded-t-3xl">
        <Link href={`/products/${p.slug || p.id}`} className="block">
          <div className="relative w-full" style={{ aspectRatio: "2/3" }}>
            {p.images?.[0] ? (
              <Image
                src={p.images[0]}
                alt={p.name}
                fill
                className="object-cover object-top group-hover:scale-103 transition-transform duration-500"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl bg-brand-light">💄</div>
            )}
          </div>
        </Link>

        {/* Share + Wishlist — bottom RIGHT, column-wise, dark visible */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-2 z-10" ref={shareRef}>
          <button
            onClick={handleOpenShare}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border border-white/30
              ${showShare ? "bg-brand-primary scale-110" : "bg-gray-800/80 hover:bg-gray-900 hover:scale-110 active:scale-95"}`}
            title="Share"
          >
            <FaShareAlt size={12} className="text-white" />
          </button>

          {/* Share Popup */}
          {showShare && (
            <div className="absolute bottom-12 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 w-52 z-50 animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-xs font-bold text-gray-700">Share Product</p>
                <button onClick={() => setShowShare(false)} className="text-gray-400 hover:text-gray-600">
                  <FiX size={13} />
                </button>
              </div>

              {/* Product mini preview */}
              <div className="bg-gray-50 rounded-xl p-2 mb-2">
                <p className="text-[10px] font-semibold text-gray-700 line-clamp-1">{p.name}</p>
                <p className="text-[10px] text-brand-primary font-bold">₹{p.price}</p>
              </div>

              {/* Short URL display */}
              <div className="bg-brand-light rounded-xl px-2.5 py-1.5 mb-2.5 flex items-center gap-1.5">
                <span className="text-[9px] text-brand-primary font-mono font-bold flex-1 truncate">
                  {shortLoading ? "Generating..." : shortUrl ? shortUrl.replace("https://www.", "") : productUrl.replace("https://www.", "").slice(0, 30) + "..."}
                </span>
                {shortUrl && <span className="text-[8px] bg-green-100 text-green-600 px-1 rounded font-bold">SHORT</span>}
              </div>

              {/* Social buttons */}
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                {shareOptions.map((s) => (
                  <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                    onClick={() => setTimeout(() => setShowShare(false), 300)}
                    className={`${s.color} text-white text-[10px] font-bold px-2 py-2 rounded-xl flex items-center gap-1.5 transition-all hover:scale-105`}>
                    {s.icon} {s.name}
                  </a>
                ))}
              </div>

              {/* Copy short URL */}
              <button onClick={handleCopy}
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-bold transition-all ${
                  copied ? "bg-green-100 text-green-600" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}>
                <FiCopy size={11} />
                {copied ? "Copied! ✓" : shortUrl ? "Copy Short Link" : "Copy Link"}
              </button>
            </div>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              if (!isLoggedIn) {
                triggerLogin("wishlist");
                return;
              }
              toggle({ id: p.id, name: p.name, slug: p.slug, brand: p.brand, price: p.price, mrp: p.mrp, images: p.images, rating: p.rating, category: p.category });
              setToast({ name: p.name, image: p.images?.[0], added: !wishlisted });
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 border border-white/30
              ${wishlisted
                ? "bg-brand-primary scale-110"
                : "bg-gray-800/80 hover:bg-gray-900 hover:scale-110 active:scale-95"
              }`}
            title={wishlisted ? "Wishlisted!" : "Add to Wishlist"}
          >
            {wishlisted
              ? <FaHeart size={13} className="text-white" />
              : <FaRegHeart size={13} className="text-white" />}
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
          {show_price ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-gray-900 leading-none">
                ₹{p.price.toLocaleString("en-IN")}
              </span>
            </div>
          ) : (
            <span className="text-xs text-brand-primary font-semibold bg-brand-light px-2 py-1 rounded-full">
              Contact for Price
            </span>
          )}
          {show_price && show_mrp && p.mrp > p.price && (
            <div className="text-right">
              <p className="text-[9px] text-gray-400">MRP</p>
              <p className="text-xs text-gray-400 line-through">₹{p.mrp.toLocaleString("en-IN")}</p>
            </div>
          )}
        </div>

        {/* Row 5: View Details (left) + Buy on WhatsApp (right) — same row */}
        <div className="flex gap-2 pt-1">
          <Link href={`/products/${p.slug || p.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 border-2 border-gray-200 hover:border-brand-primary text-gray-600 hover:text-brand-primary text-[11px] font-semibold py-2.5 rounded-xl transition-all whitespace-nowrap">
            <FiEye size={12} /> View Details
          </Link>
          <a href={`https://wa.me/918291455297?text=${waMsg}`}
            onClick={(e) => {
              if (!isLoggedIn) {
                e.preventDefault();
                triggerLogin("order");
                return;
              }
              // Track click using sendBeacon for reliability (works even when tab navigates away)
              const trackingData = JSON.stringify({
                product_id: p.id,
                product_name: p.name,
                product_brand: p.brand,
                product_price: p.price,
                customer_name: customer?.full_name || null,
                customer_phone: customer?.phone || null,
                source: "product_card",
                page_url: window.location.href,
              });
              if (navigator.sendBeacon) {
                navigator.sendBeacon("/api/track/whatsapp", new Blob([trackingData], { type: "application/json" }));
              } else {
                // Fallback for older browsers
                fetch("/api/track/whatsapp", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: trackingData,
                  keepalive: true,
                }).catch(() => {});
              }
            }}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex flex-col items-center justify-center text-white py-2 rounded-xl transition-all relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
          >
            {/* Shine sweep animation */}
            <span className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)",
                animation: "shine-sweep 2.5s ease-in-out infinite",
                backgroundSize: "200% 100%",
              }}
            />
            <div className="relative flex items-center gap-1 z-10">
              <FaWhatsapp size={13} />
              <span className="text-[11px] font-black">Buy on WhatsApp</span>
            </div>
            <span className="relative text-[8px] opacity-80 z-10">Vinod: +91-8291455297</span>
          </a>
        </div>
      </div>
    </div>
    <WishlistToast item={toast} onClose={() => setToast(null)} />
    </>
  );
}
