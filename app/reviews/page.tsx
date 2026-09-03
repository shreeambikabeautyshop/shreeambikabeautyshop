import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import { FaStar, FaWhatsapp, FaGoogle } from "react-icons/fa";
import { FiMapPin, FiExternalLink } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Customer Reviews | 4.8★ Rated Beauty Shop Mumbai | Shree Ambika — Est. 2001",
  description:
    "Read real customer reviews for Shree Ambika Beauty Shop Mumbai. 4.8★ rated by 500+ happy customers. 100% original beauty products since 2001. See what Mumbai shoppers say about us. WhatsApp: +91 82914 55297",
  alternates: { canonical: "https://www.shreeambikabeauty.com/reviews" },
  openGraph: {
    title: "Customer Reviews | 4.8★ Beauty Shop Mumbai | Shree Ambika",
    description: "500+ real customer reviews. 4.8★ rating. Mumbai's most trusted beauty shop since 2001.",
    url: "https://www.shreeambikabeauty.com/reviews",
  },
};

export const dynamic = "force-dynamic";

const ORDER_BADGE: Record<string, { label: string; color: string }> = {
  "Repeat Order":  { label: "🔄 Repeat Customer", color: "bg-purple-100 text-purple-700" },
  "Bulk Order":    { label: "📦 Bulk Order",       color: "bg-blue-100 text-blue-700" },
  "Pan India":     { label: "🚚 Pan India",        color: "bg-orange-100 text-orange-700" },
  "International": { label: "✈️ International",    color: "bg-green-100 text-green-700" },
  "Gift Order":    { label: "🎁 Gift Order",        color: "bg-pink-100 text-pink-700" },
  "Single Item":   { label: "✅ Verified Purchase", color: "bg-gray-100 text-gray-600" },
};

async function getReviews() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("reviews")
    .select("id,reviewer_name,location,review_text,images,order_type,created_at")
    .order("created_at", { ascending: false });
  return data || [];
}

export default async function ReviewsPage() {
  const reviews = await getReviews();

  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Shree Ambika Beauty Shop",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": reviews.length > 0 ? reviews.length : 500,
      "bestRating": "5",
    },
    "review": reviews.slice(0, 10).map(r => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": r.reviewer_name },
      "reviewBody": r.review_text || "Great products, 100% original!",
      "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" },
    })),
  };

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />

      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ── */}
        <div className="bg-brand-primary text-white py-12 px-4">
          <div className="max-w-[1200px] mx-auto text-center">
            <nav className="text-xs text-white/60 mb-4 flex items-center justify-center gap-2">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>›</span>
              <span className="text-white">Reviews</span>
            </nav>
            <div className="flex items-center justify-center gap-1 mb-3">
              {[1,2,3,4,5].map(s => <FaStar key={s} size={20} className="text-yellow-400" />)}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-2">
              What Our Customers Say
            </h1>
            <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto">
              Real reviews from real customers. 500+ happy customers across Mumbai and Pan India.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
              {[
                { value: "4.8★", label: "Average Rating" },
                { value: "500+", label: "Happy Customers" },
                { value: "24yr", label: "Of Trust" },
                { value: "100%", label: "Original Products" },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-black text-white">{stat.value}</p>
                  <p className="text-white/60 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 py-10">

          {/* ── Google Review CTA ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <FaGoogle size={24} className="text-red-500" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">Love shopping with us?</p>
                <p className="text-gray-500 text-xs">Share your experience on Google — it helps other customers find us!</p>
              </div>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <a href="https://g.page/r/CXXXXXXXreview" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
                <FaGoogle size={14} /> Write Google Review
              </a>
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want to share my review for your beauty shop."
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
                <FaWhatsapp size={14} /> WhatsApp Review
              </a>
            </div>
          </div>

          {/* ── Reviews Grid ── */}
          {reviews.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-4">⭐</div>
              <p className="font-semibold text-lg">Reviews coming soon!</p>
              <p className="text-sm mt-1">Be the first to share your experience.</p>
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want to share a review."
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white font-bold px-6 py-3 rounded-xl mt-6 text-sm hover:bg-green-600 transition-all">
                <FaWhatsapp size={16} /> Share Your Review
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {reviews.map((review) => {
                const badge = review.order_type ? ORDER_BADGE[review.order_type] : null;
                return (
                  <div key={review.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">

                    {/* Image */}
                    {review.images?.[0] && (
                      <div className="relative aspect-[4/3] bg-gray-50 overflow-hidden">
                        <Image
                          src={review.images[0]}
                          alt={`Review by ${review.reviewer_name}`}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        {review.images.length > 1 && (
                          <span className="absolute top-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            +{review.images.length - 1} photos
                          </span>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-4">
                      {/* Stars */}
                      <div className="flex items-center gap-0.5 mb-2">
                        {[1,2,3,4,5].map(s => <FaStar key={s} size={11} className="text-yellow-400" />)}
                      </div>

                      {/* Reviewer info */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-black text-sm">
                              {review.reviewer_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm leading-tight">{review.reviewer_name}</p>
                            {review.location && (
                              <p className="text-[10px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                                <FiMapPin size={8} /> {review.location}
                              </p>
                            )}
                          </div>
                        </div>
                        {badge && (
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${badge.color}`}>
                            {badge.label}
                          </span>
                        )}
                      </div>

                      {/* Review text */}
                      {review.review_text && (
                        <p className="text-xs text-gray-600 italic leading-relaxed line-clamp-3">
                          &ldquo;{review.review_text}&rdquo;
                        </p>
                      )}

                      {/* Date */}
                      <p className="text-[10px] text-gray-400 mt-2">
                        {new Date(review.created_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Bottom CTA ── */}
          <div className="mt-10 bg-brand-primary rounded-2xl p-7 text-center text-white">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1,2,3,4,5].map(s => <FaStar key={s} size={18} className="text-yellow-400" />)}
            </div>
            <h2 className="font-bold text-xl mb-1">Join 500+ Happy Customers</h2>
            <p className="text-white/80 text-sm mb-5 max-w-md mx-auto">
              100% original products, best prices, and personal service — direct from Vinod on WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want to order beauty products."
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all">
                <FaWhatsapp size={18} /> Order on WhatsApp
              </a>
              <Link href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-primary font-bold px-7 py-3.5 rounded-full text-sm hover:bg-brand-light transition-all">
                🛍 Browse Products
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
