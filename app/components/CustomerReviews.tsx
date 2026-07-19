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
  "Repeat Order":    { label: "🔄 Repeat Order",    color: "bg-purple-100 text-purple-700" },
  "Bulk Order":      { label: "📦 Bulk Order",       color: "bg-blue-100 text-blue-700" },
  "Pan India":       { label: "🚚 Pan India",         color: "bg-orange-100 text-orange-700" },
  "International":   { label: "✈️ International",    color: "bg-green-100 text-green-700" },
  "Gift Order":      { label: "🎁 Gift Order",        color: "bg-pink-100 text-pink-700" },
  "Single Item":     { label: "✅ Verified Purchase", color: "bg-gray-100 text-gray-600" },
};

export default function CustomerReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState<{ review: Review; imgIdx: number } | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then(({ data }) => { setReviews(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Auto-advance every 4s
  useEffect(() => {
    if (reviews.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIdx((i) => (i + 1) % reviews.length);
    }, 4000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [reviews.length]);

  const prev = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveIdx((i) => (i - 1 + reviews.length) % reviews.length);
  };
  const next = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setActiveIdx((i) => (i + 1) % reviews.length);
  };

  if (!loading && reviews.length === 0) {
    // Show a placeholder so the grid cell doesn't collapse
    return (
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-pink-100 flex flex-col items-center justify-center min-h-[260px] p-8 text-center">
        <span className="text-4xl mb-3">💬</span>
        <p className="text-sm font-bold text-gray-600 font-serif mb-1">Happy Customers</p>
        <p className="text-xs text-gray-400">Customer reviews coming soon!</p>
        <a href="https://wa.me/918291455297?text=Hi Vinod! I want to share my review."
          target="_blank" rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full">
          <FaWhatsapp size={12} /> Share Your Experience
        </a>
      </div>
    );
  }

  const review = reviews[activeIdx];
  const badge = review?.order_type ? ORDER_BADGE[review.order_type] : null;

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-pink-100 flex flex-col h-full min-h-[260px]">

      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💬</span>
          <h2 className="text-base font-black tracking-[0.15em] uppercase text-brand-primary font-sans">
            HAPPY CUSTOMERS
          </h2>
        </div>
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((s) => (
            <FaStar key={s} size={10} className="text-yellow-400" />
          ))}
          <span className="text-xs text-gray-400 ml-1">Real Orders</span>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 p-6 space-y-3">
          <div className="w-full h-32 bg-gray-100 rounded-2xl animate-pulse" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
          <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
        </div>
      ) : reviews.length === 0 ? null : (
        <div className="flex-1 flex flex-col px-5 pb-5">

          {/* Image slider */}
          <div className="relative w-full rounded-2xl overflow-hidden bg-gray-50 mb-3" style={{ aspectRatio: "16/9" }}>
            {review.images?.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-opacity duration-500 cursor-pointer ${i === 0 ? "opacity-100" : "opacity-0"}`}
                onClick={() => setLightbox({ review, imgIdx: i })}
              >
                <Image src={img} alt={`Review by ${review.reviewer_name}`} fill className="object-cover" sizes="400px" />
              </div>
            ))}
            {/* Image count badge */}
            {review.images?.length > 1 && (
              <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                📷 {review.images.length} photos
              </span>
            )}
            {/* View larger hint */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[9px] px-2 py-0.5 rounded-full">
              Tap to enlarge
            </div>
          </div>

          {/* Review info */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div>
              <p className="text-sm font-bold text-gray-800 font-serif">{review.reviewer_name}</p>
              {review.location && (
                <p className="text-[11px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                  <FiMapPin size={9} /> {review.location}
                </p>
              )}
            </div>
            {badge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${badge.color}`}>
                {badge.label}
              </span>
            )}
          </div>

          {review.review_text && (
            <p className="text-xs text-gray-500 italic font-elegant leading-relaxed line-clamp-2 mb-3">
              &ldquo;{review.review_text}&rdquo;
            </p>
          )}

          {/* Navigation + CTA */}
          <div className="flex items-center justify-between mt-auto">
            {/* Dots + arrows */}
            <div className="flex items-center gap-2">
              <button onClick={prev} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary transition-all">
                <FiChevronLeft size={13} />
              </button>
              <div className="flex gap-1">
                {reviews.map((_, i) => (
                  <button key={i} onClick={() => { if (intervalRef.current) clearInterval(intervalRef.current); setActiveIdx(i); }}
                    className={`rounded-full transition-all duration-300 ${i === activeIdx ? "bg-brand-primary w-4 h-2" : "bg-gray-300 w-2 h-2 hover:bg-gray-400"}`} />
                ))}
              </div>
              <button onClick={next} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-brand-primary hover:border-brand-primary transition-all">
                <FiChevronRight size={13} />
              </button>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/918291455297?text=Hi Vinod! I saw your customer reviews and want to place an order. Please help me!`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors shadow-sm"
            >
              <FaWhatsapp size={12} /> Order Like Them
            </a>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-lg w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white text-sm font-bold hover:text-gray-300">
              ✕ Close
            </button>
            <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "3/4" }}>
              <Image
                src={lightbox.review.images[lightbox.imgIdx]}
                alt="Review"
                fill
                className="object-contain"
                sizes="500px"
              />
            </div>
            {lightbox.review.images.length > 1 && (
              <div className="flex gap-2 mt-3 justify-center">
                {lightbox.review.images.map((img, i) => (
                  <button key={i} onClick={() => setLightbox({ ...lightbox, imgIdx: i })}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${i === lightbox.imgIdx ? "border-white" : "border-transparent opacity-60"}`}>
                    <Image src={img} alt="" fill className="object-cover" sizes="48px" />
                  </button>
                ))}
              </div>
            )}
            <div className="text-center mt-3">
              <p className="text-white font-bold text-sm">{lightbox.review.reviewer_name}</p>
              {lightbox.review.location && <p className="text-gray-400 text-xs">📍 {lightbox.review.location}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
