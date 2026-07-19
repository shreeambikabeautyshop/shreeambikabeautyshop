"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";

interface Tip {
  headline: string;
  detail: string;
  productSlug: string;
  productName: string;
  productImage: string;
  productPrice: number;
}

const trendingLooks = [
  { name: "Glass Skin Routine", icon: "✨", tag: "Trending" },
  { name: "Korean Makeup Look", icon: "🌸", tag: "Hot" },
  { name: "Peptide Serums Are In", icon: "💧", tag: "New" },
  { name: "Lip Oils", icon: "💄", tag: "Viral" },
  { name: "Hair Gloss Treatment", icon: "💫", tag: "Popular" },
  { name: "Minimal Makeup", icon: "🌿", tag: "Trending" },
];

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
                <h2 className="text-base font-black tracking-[0.2em] uppercase text-brand-primary">
                  TODAY&apos;S BEAUTY TIP
                </h2>
                <span className="text-brand-gold text-lg">✦</span>
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
                  <p className="text-sm font-bold text-gray-800 leading-snug mb-2">
                    {tip.headline}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
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

            {/* Right — women image */}
            <div className="relative w-44 flex-shrink-0 hidden sm:block">
              <Image
                src="https://res.cloudinary.com/zjlchjal/image/upload/v1784471137/today-beauty-tips_tkzbog.png"
                alt="Beauty tip model"
                fill
                className="object-cover object-top"
                sizes="176px"
              />
            </div>
          </div>

          {/* ── WHAT'S TRENDING TODAY ── */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-pink-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <h2 className="text-base font-black tracking-[0.2em] uppercase text-brand-primary">
                  WHAT&apos;S TRENDING TODAY?
                </h2>
              </div>
              <Link href="/trending" className="text-xs font-semibold text-brand-secondary hover:underline">
                Show All →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {trendingLooks.map((item, idx) => (
                <Link
                  key={idx}
                  href="/trending"
                  className="group flex flex-col items-center text-center gap-1.5 p-3 rounded-xl bg-brand-light hover:bg-pink-100 transition-colors"
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-[10px] font-semibold text-gray-700 leading-tight">{item.name}</span>
                  <span className="text-[9px] bg-brand-primary text-white px-2 py-0.5 rounded-full font-bold">
                    {item.tag}
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
