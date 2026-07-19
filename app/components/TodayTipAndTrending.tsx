"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import CustomerReviews from "./CustomerReviews";

interface Tip {
  headline: string;
  detail: string;
  productSlug: string;
  productName: string;
  productImage: string;
  productPrice: number;
}

const trendingLooks: unknown[] = [];
void trendingLooks; // unused - replaced by CustomerReviews

export default function TodayTipAndTrending() {
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/beauty-tip")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setTip(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const waMsg = tip
    ? encodeURIComponent(
        `Hi Vinod! I saw today's beauty tip and want to order:\n\n*${tip.productName}*\nPrice: ₹${tip.productPrice}\n\nhttps://shreeambikabeautyshop.vercel.app/products/${tip.productSlug}`
      )
    : "";

  return (
    <section className="py-10 bg-brand-light" aria-label="Beauty Tips and Trending">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">

          {/* ── TODAY'S BEAUTY TIP ── */}
          <div
            className="relative rounded-3xl overflow-hidden shadow-md border border-pink-100 min-h-[220px] flex"
            style={{ background: "linear-gradient(135deg, #fff5f7 0%, #fce8ee 60%, #ffd6e4 100%)" }}
          >
            {/* Left content */}
            <div className="flex-1 p-7 flex flex-col justify-between z-10">
              {/* Header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💡</span>
                <h2 className="text-base font-black tracking-[0.2em] uppercase text-brand-primary font-sans">
                  TODAY&apos;S BEAUTY TIP
                </h2>
                <span className="text-brand-gold text-lg font-script">✦</span>
              </div>

              {loading ? (
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-pink-200/60 rounded animate-pulse w-4/5" />
                  <div className="h-4 bg-pink-200/60 rounded animate-pulse w-3/5" />
                  <div className="h-3 bg-pink-100/60 rounded animate-pulse w-full mt-3" />
                  <div className="h-3 bg-pink-100/60 rounded animate-pulse w-4/5" />
                </div>
              ) : tip ? (
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 leading-snug mb-2 font-serif">
                    {tip.headline}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4 font-sans">
                    {tip.detail}
                  </p>

                  {/* CTA buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/products/${tip.productSlug}`}
                      className="inline-flex items-center gap-1.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md"
                    >
                      Buy This Product →
                    </Link>
                    <a
                      href={`https://wa.me/918291455297?text=${waMsg}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm"
                    >
                      <FaWhatsapp size={12} /> Order on WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 leading-snug mb-2">
                    Never skip sunscreen! It prevents more than 80% of ageing, pigmentation &amp; sun damage.
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    Use SPF 30 or higher every day, even indoors.
                  </p>
                  <Link
                    href="/beauty-tips"
                    className="inline-block bg-brand-primary text-white text-xs font-bold px-5 py-2 rounded-full"
                  >
                    Explore Beauty Tips →
                  </Link>
                </div>
              )}
            </div>

            {/* Right — Why Choose mini panel */}
            <div className="relative w-52 flex-shrink-0 hidden sm:flex flex-col justify-center px-5 py-6 border-l border-pink-200/50">
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-gold mb-3">♛ Why Choose Us</p>
              <ul className="space-y-2.5">
                {[
                  { icon: "✅", text: "100% Original Products" },
                  { icon: "🏷️", text: "Best Prices & Max Discount" },
                  { icon: "🚚", text: "Same Day Mumbai Delivery" },
                  { icon: "💬", text: "Expert Beauty Guidance" },
                  { icon: "🌍", text: "Pan India + International" },
                  { icon: "⭐", text: "Trusted Since 2001" },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-2">
                    <span className="text-sm">{item.icon}</span>
                    <span className="text-[11px] font-semibold text-gray-700 leading-tight">{item.text}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://wa.me/918291455297"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-[11px] font-bold px-3 py-2 rounded-full transition-colors"
              >
                <FaWhatsapp size={11} /> Shop on WhatsApp
              </a>
            </div>
          </div>

          {/* ── HAPPY CUSTOMERS (Social Proof) ── */}
          <CustomerReviews />

        </div>
      </div>
    </section>
  );
}
