"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FaInstagram, FaFacebook, FaWhatsapp, FaYoutube,
  FaLinkedin, FaPinterest, FaThreads,
} from "react-icons/fa6";
import { FaTwitter, FaGlobe, FaStar } from "react-icons/fa";
import { SiGooglemaps } from "react-icons/si";
import { MdVerified, MdStorefront } from "react-icons/md";
import { FiMapPin, FiPhone, FiClock } from "react-icons/fi";

const socialLinks = [
  { name: "Instagram",   icon: <FaInstagram size={20} />,  href: "https://instagram.com/shreeambikabeautyshop", color: "from-purple-500 via-pink-500 to-orange-400", bg: "bg-gradient-to-br" },
  { name: "Facebook",    icon: <FaFacebook size={20} />,   href: "#",                                           color: "bg-blue-600",    bg: "" },
  { name: "Threads",     icon: <FaThreads size={20} />,    href: "#",                                           color: "bg-gray-900",    bg: "" },
  { name: "Twitter",     icon: <FaTwitter size={20} />,    href: "#",                                           color: "bg-black",       bg: "" },
  { name: "LinkedIn",    icon: <FaLinkedin size={20} />,   href: "#",                                           color: "bg-blue-700",    bg: "" },
  { name: "WhatsApp",    icon: <FaWhatsapp size={20} />,   href: "https://wa.me/918291455297",                  color: "bg-green-500",   bg: "" },
  { name: "YouTube",     icon: <FaYoutube size={20} />,    href: "#",                                           color: "bg-red-600",     bg: "" },
  { name: "Pinterest",   icon: <FaPinterest size={20} />,  href: "#",                                           color: "bg-red-500",     bg: "" },
  { name: "Website",     icon: <FaGlobe size={20} />,      href: "/",                                           color: "bg-brand-primary", bg: "" },
  { name: "Google Maps", icon: <SiGooglemaps size={20} />, href: "https://maps.google.com",                     color: "bg-blue-500",    bg: "" },
];

const legacyPoints = [
  { icon: "🏆", title: "Est. 2001", desc: "24+ years of serving customers with trust & honesty" },
  { icon: "💍", title: "Wide Range", desc: "Bangles, Jewellery, Accessories, Cosmetics & more" },
  { icon: "🤝", title: "Our Legacy", desc: "Thousands of happy customers across Mumbai & India" },
];

const newShopPoints = [
  { icon: "💡", title: "Why We Launched", desc: "Our customers needed more variety in cosmetics & beauty" },
  { icon: "✨", title: "Our Promise", desc: "100% Original, More Brands, Better Prices, Better Service" },
  { icon: "👩", title: "For Everyone", desc: "Every woman, every salon, every beauty professional" },
];

const stats = [
  { value: "24+", label: "Years of Trust" },
  { value: "10K+", label: "Happy Customers" },
  { value: "500+", label: "Brands" },
  { value: "Mumbai", label: "Based in" },
];

export default function SocialConnect() {
  const [hoveredSocial, setHoveredSocial] = useState<string | null>(null);

  return (
    <section className="py-16 overflow-hidden" style={{ background: "linear-gradient(135deg, #fff5f7 0%, #fce8ee 40%, #fff0f3 100%)" }}
      aria-labelledby="social-heading">
      <div className="max-w-[1400px] mx-auto px-4">

        {/* ── Section Header ── */}
        <div className="text-center mb-12">
          <p className="text-brand-gold text-xs font-bold uppercase tracking-[0.3em] mb-2">✦ CONNECT WITH US ✦</p>
          <h2 id="social-heading" className="text-3xl md:text-4xl font-heading italic text-brand-primary mb-2">
            We Are Everywhere
          </h2>
          <p className="text-gray-500 text-sm font-elegant italic">Your beauty, our responsibility — reach us anywhere, anytime</p>
        </div>

        {/* ── Stats Bar ── */}
        <div className="grid grid-cols-4 gap-4 mb-12">
          {stats.map((s) => (
            <div key={s.label}
              className="bg-white rounded-2xl p-4 text-center shadow-sm border border-pink-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <p className="text-2xl font-black text-brand-primary font-heading">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-sans">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Main 40/60 Grid ── */}
        <div className="grid lg:grid-cols-[40%_60%] gap-8 items-stretch">

          {/* ── LEFT 40%: Social Connect ── */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-pink-100 flex flex-col">

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <MdStorefront size={20} className="text-brand-primary" />
                <h3 className="text-lg font-bold text-brand-primary font-sans uppercase tracking-wide">Order From Anywhere</h3>
              </div>
              <p className="text-sm text-gray-500">Connect on your favourite platform and order in just a few clicks!</p>
            </div>

            {/* Social Grid */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              {socialLinks.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.name} title={s.name}
                  onMouseEnter={() => setHoveredSocial(s.name)}
                  onMouseLeave={() => setHoveredSocial(null)}
                  className={`
                    ${s.bg === "bg-gradient-to-br" ? `bg-gradient-to-br ${s.color}` : s.color}
                    text-white rounded-2xl p-3 flex flex-col items-center justify-center gap-1
                    transition-all duration-300 shadow-sm
                    ${hoveredSocial === s.name ? "scale-110 shadow-lg" : "hover:scale-105"}
                  `}
                >
                  {s.icon}
                  {hoveredSocial === s.name && (
                    <span className="text-[8px] font-bold leading-none opacity-90">{s.name.split(" ")[0]}</span>
                  )}
                </a>
              ))}
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FiPhone size={14} className="text-brand-primary flex-shrink-0" />
                <span>WhatsApp: <strong className="text-brand-primary">+91-8291455297</strong> (Vinod)</span>
              </div>
              <div className="flex items-center gap-2">
                <FiMapPin size={14} className="text-brand-primary flex-shrink-0" />
                <span>Dahisar, Mumbai, Maharashtra</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock size={14} className="text-brand-primary flex-shrink-0" />
                <span>Mon–Sun: 9 AM – 9 PM</span>
              </div>
            </div>

            <p className="text-xs text-center text-gray-400 italic mb-4">
              DM • WhatsApp • Website • Call • Visit Store<br />
              <span className="text-brand-primary">♡ Your Order, Our Priority ♡</span>
            </p>

            {/* CTA */}
            <a href="https://wa.me/918291455297?text=Hi Vinod! I want to place an order."
              target="_blank" rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 text-sm">
              <FaWhatsapp size={18} />
              ORDER NOW — Anytime, Anywhere!
            </a>
          </div>

          {/* ── RIGHT 60%: Legacy ── */}
          <div className="flex flex-col gap-6">

            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/80 px-4 py-1.5 rounded-full border border-brand-gold/30 mb-3">
                <FaStar size={11} className="text-brand-gold" />
                <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">Since 2001</span>
                <FaStar size={11} className="text-brand-gold" />
              </div>
              <h3 className="text-2xl font-heading italic text-brand-primary">Our Legacy, Your Trust</h3>
              <p className="text-xs text-gray-400 mt-1 font-elegant italic">From a trusted family store to your one-stop beauty destination</p>
            </div>

            {/* Two cards side by side */}
            <div className="grid grid-cols-2 gap-5 flex-1">

              {/* Choice Center */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-pink-100 hover:shadow-md transition-all duration-300 flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center flex-shrink-0">
                    <MdVerified size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-wide">Shree Ambika</p>
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-wide">Choice Center</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mb-4 italic">(Parent Brand — Est. 2001)</p>
                <div className="space-y-3 flex-1">
                  {legacyPoints.map((p) => (
                    <div key={p.title} className="flex gap-2.5 group">
                      <span className="text-lg leading-none mt-0.5 group-hover:scale-110 transition-transform">{p.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-brand-primary">{p.title}</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Beauty Shop */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-rose-100 hover:shadow-md transition-all duration-300 flex flex-col"
                style={{ background: "linear-gradient(135deg, #fff5f7, #fff)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-brand-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-black">SA</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-brand-secondary uppercase tracking-wide">Shree Ambika</p>
                    <p className="text-[10px] font-black text-brand-secondary uppercase tracking-wide">Beauty Shop</p>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mb-4 italic">(Our New Step)</p>
                <div className="space-y-3 flex-1">
                  {newShopPoints.map((p) => (
                    <div key={p.title} className="flex gap-2.5 group">
                      <span className="text-lg leading-none mt-0.5 group-hover:scale-110 transition-transform">{p.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-brand-secondary">{p.title}</p>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom tagline */}
            <div className="bg-white rounded-2xl px-6 py-4 border border-pink-100 text-center shadow-sm">
              <p className="text-sm font-bold text-brand-primary font-serif">
                TWO SHOPS, ONE FAMILY, ONE PROMISE
              </p>
              <p className="text-xs text-gray-500 mt-1 font-elegant italic">
                Your Beauty, Our Responsibility ♡ — Serving Mumbai & Pan India since 2001
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
