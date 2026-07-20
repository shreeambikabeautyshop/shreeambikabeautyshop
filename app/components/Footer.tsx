"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaInstagram, FaFacebook, FaWhatsapp, FaYoutube, FaThreads,
} from "react-icons/fa6";
import { FaTwitter } from "react-icons/fa";
import { MdEmail, MdLocationOn, MdPhone, MdVerified } from "react-icons/md";
import { FiSend, FiArrowRight } from "react-icons/fi";

const quickLinks = [
  { name: "Home",              href: "/" },
  { name: "All Products",      href: "/products" },
  { name: "Categories",        href: "/categories" },
  { name: "Shop by Occasion",  href: "/occasions" },
  { name: "Beauty Tips",       href: "/beauty-tips" },
  { name: "Find My Product",   href: "/products" },
];

const helpLinks = [
  { name: "About Us",          href: "/about" },
  { name: "Contact Us",        href: "/contact" },
  { name: "How to Order",      href: "/how-to-order" },
  { name: "Delivery Info",     href: "/delivery" },
  { name: "Returns & Exchange",href: "/returns" },
  { name: "FAQ",               href: "/faq" },
];

const legalLinks = [
  { name: "Privacy Policy",    href: "/privacy-policy" },
  { name: "Shipping Policy",   href: "/shipping-policy" },
  { name: "Terms of Service",  href: "/terms" },
];

const socials = [
  { icon: <FaInstagram size={17} />, href: "https://instagram.com/shreeambikabeautyshop", label: "Instagram", color: "hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-400" },
  { icon: <FaFacebook size={17} />,  href: "#",                                            label: "Facebook",  color: "hover:bg-blue-600" },
  { icon: <FaWhatsapp size={17} />,  href: "https://wa.me/918291455297",                   label: "WhatsApp",  color: "hover:bg-green-500" },
  { icon: <FaYoutube size={17} />,   href: "#",                                            label: "YouTube",   color: "hover:bg-red-600" },
  { icon: <FaTwitter size={17} />,   href: "#",                                            label: "Twitter",   color: "hover:bg-black" },
  { icon: <FaThreads size={17} />,   href: "#",                                            label: "Threads",   color: "hover:bg-gray-800" },
];

const categories = [
  { name: "💄 Cosmetics",          href: "/categories/cosmetics" },
  { name: "🎨 Makeup",             href: "/categories/makeup" },
  { name: "✨ Skin Care",          href: "/categories/skincare" },
  { name: "💆 Hair Care",          href: "/categories/haircare" },
  { name: "🧴 Body Care",          href: "/categories/bodycare" },
  { name: "🌸 Perfumes",           href: "/categories/perfumes" },
  { name: "💅 Electronics",        href: "/categories/electronics" },
  { name: "👜 Purses & Bags",      href: "/categories/purses-bags" },
  { name: "🪮 Wax & Accessories",  href: "/categories/wax-accessories" },
];

export default function Footer() {
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [subDone, setSubDone] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !phone) return;
    // In a real setup you'd POST to an API / Supabase table
    setSubDone(true);
    setEmail("");
    setPhone("");
    setTimeout(() => setSubDone(false), 5000);
  };

  return (
    <footer className="bg-gray-950 text-white" aria-label="Site Footer">

      {/* ── Newsletter / Subscribe bar ── */}
      <div className="bg-brand-primary">
        <div className="max-w-[1400px] mx-auto px-4 py-8 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-heading italic text-white">Get Daily Beauty Updates</h3>
            <p className="text-white/80 text-sm mt-1">
              New arrivals, offers & beauty tips — straight to your WhatsApp or email.
            </p>
          </div>
          {subDone ? (
            <div className="flex items-center gap-2 bg-white/20 px-6 py-3 rounded-2xl">
              <MdVerified size={20} className="text-green-300" />
              <span className="text-white font-bold">You're subscribed! We'll be in touch.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:min-w-[500px]">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white/30 transition-all"
              />
              <input
                type="tel"
                placeholder="WhatsApp number (+91...)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white/30 transition-all"
              />
              <button type="submit"
                className="flex items-center justify-center gap-2 bg-white text-brand-primary font-bold px-5 py-2.5 rounded-xl hover:bg-brand-light transition-all shadow-sm whitespace-nowrap">
                <FiSend size={14} /> Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── Main footer ── */}
      <div className="max-w-[1400px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Col 1 — Brand */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <div className="relative w-[140px] h-[50px] mb-4">
              <Image
                src="https://res.cloudinary.com/zjlchjal/image/upload/v1784563982/shree-ambika-beauty-shop-logo_wdds5i.png"
                alt="Shree Ambika Beauty Shop"
                fill
                className="object-contain object-left brightness-0 invert"
                sizes="140px"
              />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              Mumbai&apos;s trusted beauty shop since 2001. 100% original products from 500+ brands.
              Your Beauty, Our Responsibility ♡
            </p>

            {/* Socials */}
            <div className="flex gap-2 flex-wrap mb-5">
              {socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  aria-label={s.label}
                  className={`w-9 h-9 bg-white/10 ${s.color} rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110`}>
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Trust badges */}
            <div className="flex flex-col gap-1">
              {[
                { icon: "✓", text: "100% Original Products" },
                { icon: "✓", text: "Est. 2001 — 24 Years of Trust" },
                { icon: "✓", text: "Pan India & International Delivery" },
              ].map((b) => (
                <p key={b.text} className="text-xs text-gray-500 flex items-center gap-1.5">
                  <span className="text-green-400 font-bold">{b.icon}</span> {b.text}
                </p>
              ))}
            </div>
          </div>

          {/* Col 2 — Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 group transition-colors">
                    <FiArrowRight size={12} className="text-brand-accent group-hover:translate-x-1 transition-transform" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Categories */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Categories</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link href={cat.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Help */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Help & Support</h3>
            <ul className="space-y-2 mb-6">
              {helpLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1.5 group transition-colors">
                    <FiArrowRight size={12} className="text-brand-accent group-hover:translate-x-1 transition-transform" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="font-bold text-white mb-3 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5 — Contact */}
          <div>
            <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2.5">
                <MdPhone size={15} className="text-brand-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">WhatsApp / Call</p>
                  <a href="https://wa.me/918291455297" target="_blank" rel="noopener noreferrer"
                    className="text-sm text-white font-semibold hover:text-brand-accent transition-colors">
                    +91-8291455297
                  </a>
                  <p className="text-xs text-gray-500 mt-0.5">(Vinod — Mon–Sun 9AM–9PM)</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MdEmail size={15} className="text-brand-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <a href="mailto:shreeambikabeautyshop@gmail.com"
                    className="text-sm text-white hover:text-brand-accent transition-colors break-all">
                    shreeambikabeautyshop@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MdLocationOn size={15} className="text-brand-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Store Address</p>
                  <p className="text-sm text-white">Anand Nagar Metro Station,</p>
                  <p className="text-sm text-white">Dahisar East, Mumbai 400068</p>
                  <a href="https://maps.google.com/?q=Anand+Nagar+Metro+Station+Dahisar+East+Mumbai"
                    target="_blank" rel="noopener noreferrer"
                    className="text-xs text-brand-accent hover:underline mt-1 inline-block">
                    📍 View on Google Maps →
                  </a>
                </div>
              </li>
            </ul>

            {/* WhatsApp Community CTA */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4">
              <p className="text-xs font-bold text-green-400 uppercase tracking-wide mb-1">Join Our Community</p>
              <p className="text-xs text-gray-400 mb-3">Get daily deals, beauty tips & new arrivals on WhatsApp</p>
              <a href="https://wa.me/918291455297?text=Hi! I want to join your WhatsApp beauty updates group."
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all">
                <FaWhatsapp size={14} /> Join WhatsApp Group
              </a>
            </div>

            {/* Payments */}
            <div className="mt-4">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">We Accept</p>
              <div className="flex gap-1.5 flex-wrap">
                {["UPI", "GPay", "PhonePe", "Paytm", "Cash", "COD"].map((pay) => (
                  <span key={pay}
                    className="bg-white/10 text-gray-400 text-[10px] px-2 py-0.5 rounded-lg font-medium">
                    {pay}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Shree Ambika Beauty Shop, Mumbai. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <Link href="/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/shipping-policy" className="hover:text-gray-300 transition-colors">Shipping</Link>
            <span>•</span>
            <Link href="/returns" className="hover:text-gray-300 transition-colors">Returns</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
          </p>
        </div>
      </div>

    </footer>
  );
}
