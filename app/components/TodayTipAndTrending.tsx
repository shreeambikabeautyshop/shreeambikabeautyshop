"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa";
import { MdVerified } from "react-icons/md";
import { FiShield, FiStar, FiPackage, FiTruck, FiMessageCircle } from "react-icons/fi";
import CustomerReviews from "./CustomerReviews";

interface Tip {
  headline: string;
  detail: string;
  productSlug: string;
  productName: string;
  productImage: string;
  productPrice: number;
}

const whyPoints = [
  { icon: <MdVerified size={18} />, text: "100% Original Products", sub: "Direct from Brands & Company" },
  { icon: <FiPackage size={18} />, text: "Best Prices & Max Discount", sub: "Always As Possible" },
  { icon: <FiShield size={18} />, text: "Wide Range for Every Need", sub: "From Daily Essentials to Professional" },
  { icon: <FiStar size={18} />, text: "Trusted Since 2001", sub: "25+ Years of Trust & Happiness" },
  { icon: <FiTruck size={18} />, text: "Same Day Mumbai Delivery", sub: "Pan India + International" },
  { icon: <FiMessageCircle size={18} />, text: "Expert Beauty Guidance", sub: "We Guide, You Glow" },
];

export default function TodayTipAndTrending() {
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/beauty-tip")
      .then((r) => r.json())
      .then((data) => { if (!data.error) setTip(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const waMsg = tip
    ? encodeURIComponent(
        `Hi Vinod! I saw today's beauty tip and want to order:\n\n*${tip.productName}*\nPrice: ₹${tip.productPrice}\n\nhttps://shreeambikabeautyshop.vercel.app/products/${tip.productSlug}`
      )
    : "";

  return (
    <section className="py-10 bg-brand-light" aria-label="Beauty Tips and Why Choose Us">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">

          {/* ── LEFT: TODAY'S BEAUTY TIP ── */}
          <div
            className="relative rounded-3xl overflow-hidden shadow-md border border-pink-100 min-h-[260px] flex"
            style={{ background: "linear-gradient(135deg, #fff5f7 0%, #fce8ee 60%, #ffd6e4 100%)" }}
          >
            <div className="flex-1 p-7 flex flex-col justify-between z-10">
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
                  <p className="text-sm font-bold text-gray-800 leading-snug mb-2 font-serif">{tip.headline}</p>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4 font-sans">{tip.detail}</p>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/products/${tip.productSlug}`}
                      className="inline-flex items-center gap-1.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md">
                      Buy This Product →
                    </Link>
                    <a href={`https://wa.me/918291455297?text=${waMsg}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-sm">
                      <FaWhatsapp size={12} /> Order on WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800 leading-snug mb-2">
                    Never skip sunscreen! It prevents more than 80% of ageing, pigmentation &amp; sun damage.
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">Use SPF 30 or higher every day, even indoors.</p>
                  <Link href="/beauty-tips"
                    className="inline-block bg-brand-primary text-white text-xs font-bold px-5 py-2 rounded-full">
                    Explore Beauty Tips →
                  </Link>
                </div>
              )}
            </div>

            {/* Women image */}
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

          {/* ── RIGHT: WHY CHOOSE US (compact) ── */}
          <div
            className="rounded-3xl p-7 shadow-md border border-pink-100 flex flex-col"
            style={{ background: "linear-gradient(135deg, #fff5f7 0%, #fce8ee 60%, #ffd6e4 100%)" }}
          >
            {/* Header */}
            <div className="mb-5">
              <p className="text-[11px] font-bold text-brand-gold uppercase tracking-widest mb-1">⊕ WHY EVERY WOMAN CHOOSES ⊕</p>
              <h2 className="text-xl font-bold text-brand-primary font-heading italic leading-tight">
                Shree Ambika Beauty Store
              </h2>
            </div>

            {/* Points grid */}
            <div className="grid grid-cols-2 gap-3 flex-1">
              {whyPoints.map((p, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="text-brand-primary mt-0.5 flex-shrink-0">{p.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-gray-800 leading-tight">{p.text}</p>
                    <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{p.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="https://wa.me/918291455297?text=Hi Vinod! I want to shop from Shree Ambika Beauty Shop."
              target="_blank" rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all shadow-sm"
            >
              <FaWhatsapp size={16} /> Shop on WhatsApp
            </a>
          </div>

        </div>

        {/* ── Customer Reviews Slider ── */}
        <div className="mt-8">
          <CustomerReviews />
        </div>

      </div>
    </section>
  );
}
