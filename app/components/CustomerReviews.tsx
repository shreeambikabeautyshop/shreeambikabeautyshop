"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight, FiMapPin } from "react-icons/fi";
import { FaWhatsapp, FaStar } from "react-icons/fa";

interface Review {
  id: string;
  reviewer_name: string;
  location?: string;
  review_text?: string;
  images: string[];
  order_type?: string;
}

const ORDER_BADGE: Record<string, { label: string; color: string }> = {
  "Repeat Order":  { label: "🔄 Repeat",      color: "bg-purple-100 text-purple-700" },
  "Bulk Order":    { label: "📦 Bulk",         color: "bg-blue-100 text-blue-700" },
  "Pan India":     { label: "🚚 Pan India",    color: "bg-orange-100 text-orange-700" },
  "International": { label: "✈️ Intl",         color: "bg-green-100 text-green-700" },
  "Gift Order":    { label: "🎁 Gift",         color: "bg-pink-100 text-pink-700" },
  "Single Item":   { label: "✅ Verified",     color: "bg-gray-100 text-gray-600" },
};

const PER_VIEW = 3; // show 3 cards at once

export default function CustomerReviews() {
  const [reviews, setReviews]     = useState<Review[]>([]);
  const [loading, setLoading]     = useState(true);
  const [startIdx, setStartIdx]   = useState(0);
  const [lightbox, setLightbox]   = useState<{ review: Review; imgIdx: number } | null>(null);
  const intervalRef               = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then(({ data }) => { setReviews(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Auto-slide every 5s
  useEffect(() => {
    if (reviews.length <= PER_VIEW) return;
    intervalRef.current = setInterval(() => {
      setStartIdx((i) => (i + 1) % reviews.length);
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [reviews.length]);

  const pause = () => { if (intervalRef.current) clearInterval(intervalRef.current); };

  const prev = () => { pause(); setStartIdx((i) => (i - 1 + reviews.length) % reviews.length); };
  const next = () => { pause(); setStartIdx((i) => (i + 1) % reviews.length); };

  // Get 3 visible cards (circular)
  const visible = reviews.length > 0
    ? Array.from({ length: Math.min(PER_VIEW, reviews.length) }, (_, i) => reviews[(startIdx + i) % reviews.length])
    : [];

  if (!loading && reviews.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <span className="text-base">💬</span>
          <h2 className="text-xs font-black tracking-[0.15em] uppercase text-brand-primary font-sans">
            Happy Customers
          </h2>
        </div>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((s) => <FaStar key={s} size={9} className="text-yellow-400" />)}
          <span className="text-[10px] text-gray-400 ml-1">Real Orders</span>
        </div>
      </div>

      {/* ── Cards ── */}
      {loading ? (
        <div className="grid grid-cols-3 gap-3 p-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-50 animate-pulse h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3 p-4">
          {visible.map((review, i) => {
            const badge = review.order_type ? ORDER_BADGE[review.order_type] : null;
            return (
              <div key={review.id + i}
                className="group flex flex-col rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 bg-white">

                {/* Image */}
                <div
                  className="relative w-full cursor-pointer overflow-hidden bg-gray-50"
                  style={{ aspectRatio: "4/3" }}
                  onClick={() => setLightbox({ review, imgIdx: 0 })}
                >
                  {review.images?.[0] ? (
                    <Image
                      src={review.images[0]}
                      alt={review.reviewer_name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 90vw, 30vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">⭐</div>
                  )}
                  {review.images?.length > 1 && (
                    <span className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      +{review.images.length - 1}
                    </span>
                  )}
                  {/* Tap hint */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[9px] font-bold bg-black/50 px-2 py-0.5 rounded-full">
                      Tap to enlarge
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-gray-800 truncate font-serif">{review.reviewer_name}</p>
                    {badge && (
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${badge.color}`}>
                        {badge.label}
                      </span>
                    )}
                  </div>
                  {review.location && (
                    <p className="text-[10px] text-gray-400 flex items-center gap-0.5">
                      <FiMapPin size={8} /> {review.location}
                    </p>
                  )}
                  {review.review_text && (
                    <p className="text-[10px] text-gray-500 italic leading-relaxed line-clamp-2 font-elegant">
                      &ldquo;{review.review_text}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer: nav + CTA ── */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between px-5 pb-4">
          {/* Prev/dots/next */}
          <div className="flex items-center gap-2">
            <button onClick={prev}
              className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary transition-all">
              <FiChevronLeft size={12} />
            </button>
            <div className="flex gap-1">
              {reviews.map((_, i) => (
                <button key={i} onClick={() => { pause(); setStartIdx(i); }}
                  className={`rounded-full transition-all duration-300 ${i === startIdx ? "bg-brand-primary w-4 h-1.5" : "bg-gray-300 w-1.5 h-1.5"}`} />
              ))}
            </div>
            <button onClick={next}
              className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary transition-all">
              <FiChevronRight size={12} />
            </button>
          </div>

          {/* WhatsApp CTA */}
          <a href="https://wa.me/918291455297?text=Hi Vinod! I saw your customer reviews and want to place an order!"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors shadow-sm">
            <FaWhatsapp size={11} /> Order Like Them
          </a>
        </div>
      )}

      {/* ── Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}>
          <div className="relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)}
              className="absolute -top-8 right-0 text-white text-sm font-bold hover:text-gray-300">✕ Close</button>
            <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "3/4" }}>
              <Image src={lightbox.review.images[lightbox.imgIdx]} alt="Review" fill className="object-contain" sizes="400px" />
            </div>
            {lightbox.review.images.length > 1 && (
              <div className="flex gap-2 mt-3 justify-center">
                {lightbox.review.images.map((img, i) => (
                  <button key={i} onClick={() => setLightbox({ ...lightbox, imgIdx: i })}
                    className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${i === lightbox.imgIdx ? "border-white" : "border-transparent opacity-60"}`}>
                    <Image src={img} alt="" fill className="object-cover" sizes="40px" />
                  </button>
                ))}
              </div>
            )}
            <p className="text-center text-white font-bold text-sm mt-2">{lightbox.review.reviewer_name}</p>
            {lightbox.review.location && <p className="text-center text-gray-400 text-xs">📍 {lightbox.review.location}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
