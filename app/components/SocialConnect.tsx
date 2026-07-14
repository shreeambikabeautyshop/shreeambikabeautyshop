import Link from "next/link";
import {
  FaInstagram,
  FaFacebook,
  FaWhatsapp,
  FaYoutube,
  FaLinkedin,
  FaPinterest,
  FaThreads,
} from "react-icons/fa6";
import { FaTwitter, FaGlobe } from "react-icons/fa";
import { SiGooglemaps } from "react-icons/si";

const socialLinks = [
  { name: "Instagram", icon: <FaInstagram size={22} />, href: "#", color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400" },
  { name: "Facebook", icon: <FaFacebook size={22} />, href: "#", color: "bg-blue-600" },
  { name: "Threads", icon: <FaThreads size={22} />, href: "#", color: "bg-gray-900" },
  { name: "Twitter (X)", icon: <FaTwitter size={22} />, href: "#", color: "bg-black" },
  { name: "LinkedIn", icon: <FaLinkedin size={22} />, href: "#", color: "bg-blue-700" },
  { name: "WhatsApp Community", icon: <FaWhatsapp size={22} />, href: "https://wa.me/919999999999", color: "bg-green-500" },
  { name: "YouTube", icon: <FaYoutube size={22} />, href: "#", color: "bg-red-600" },
  { name: "Pinterest", icon: <FaPinterest size={22} />, href: "#", color: "bg-red-500" },
  { name: "Website", icon: <FaGlobe size={22} />, href: "#", color: "bg-brand-primary" },
  { name: "Google Maps", icon: <SiGooglemaps size={22} />, href: "#", color: "bg-blue-500" },
];

const legacyPoints = [
  {
    title: "Est. 2001",
    desc: "Serving customers with trust & honesty",
  },
  {
    title: "Wide Range Products",
    desc: "Mix Bangles, Rental Jewellery, Fancy & Regular Accessories, Imitation Jewellery (Sales & Rent), Cosmetics & more",
  },
  {
    title: "Our Legacy",
    desc: "Years of customer trust, relationships & satisfaction",
  },
];

const newShopPoints = [
  {
    title: "Why We Launched",
    desc: "We noticed our customers were not getting enough variety in cosmetics.",
  },
  {
    title: "Our Promise",
    desc: "More Variety, More Brands, 100% Original Products, Better Prices & Better Service.",
  },
  {
    title: "For Everyone",
    desc: "From small needs to big goals – for every woman, every salon, every beauty professional.",
  },
];

export default function SocialConnect() {
  return (
    <section className="py-14 bg-white" aria-labelledby="social-heading">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-10 items-start">

          {/* Left - Order Online From Anywhere */}
          <div className="bg-brand-light rounded-3xl p-7">
            <h2 id="social-heading" className="text-2xl font-bold text-brand-primary font-serif mb-1">
              WE ARE EVERYWHERE
            </h2>
            <p className="text-brand-secondary font-semibold text-sm mb-1">♡ TO SERVE YOU, ALWAYS! ♡</p>
            <div className="my-4">
              <div className="bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                ORDER ONLINE FROM ANYWHERE
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Connect with us on your favourite platform and place your order in just a few clicks!
              </p>
              <div className="grid grid-cols-5 gap-2 mb-5">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className={`${s.color} text-white rounded-xl p-2.5 flex items-center justify-center hover:opacity-90 hover:scale-110 transition-all shadow-sm`}
                    title={s.name}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center">
                DM • WHATSAPP • WEBSITE • CALL • VISIT STORE
              </p>
              <p className="text-xs text-brand-primary text-center mt-1 italic">
                ♡ Your Order, Our Priority ♡
              </p>
            </div>

            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-5 rounded-full hover:bg-brand-dark transition-colors mt-2"
            >
              ORDER NOW — Anytime, Anywhere!
            </a>
          </div>

          {/* Center - Brand Logo & Tagline */}
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-20 h-20 rounded-full bg-brand-primary flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl font-serif">SA</span>
            </div>
            <h3 className="text-2xl font-black text-brand-primary font-serif">श्री अम्बिका</h3>
            <p className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-4">BEAUTY SHOP</p>
            <p className="text-xl font-bold text-gray-700 font-serif italic">
              Beauty Delivered
            </p>
            <p className="text-brand-secondary font-medium text-sm italic">With Trust & Love ♡</p>
            <div className="mt-6 p-4 bg-brand-light rounded-2xl text-sm text-gray-600 leading-relaxed">
              <strong className="text-brand-primary block mb-1">TWO SHOPS, ONE FAMILY, ONE PROMISE –</strong>
              Your Beauty, Our Responsibility ♡
            </div>
          </div>

          {/* Right - Our Legacy */}
          <div>
            <div className="text-center mb-6">
              <span className="text-brand-gold text-xs uppercase tracking-widest font-bold">
                ✦ Since 2001 ✦
              </span>
              <h3 className="text-xl font-bold text-brand-primary font-serif mt-1">
                OUR LEGACY, YOUR TRUST
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                From a trusted family store to your one-stop beauty destination.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Shree Ambika Choice Center */}
              <div className="bg-brand-light rounded-2xl p-4">
                <div className="bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3 text-center">
                  SHREE AMBIKA CHOICE CENTER
                </div>
                <p className="text-[10px] text-center text-gray-400 mb-3">(Parent Brand)</p>
                {legacyPoints.map((p, i) => (
                  <div key={i} className="mb-3">
                    <p className="text-xs font-bold text-brand-primary">{p.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>

              {/* Shree Ambika Beauty Shop */}
              <div className="bg-rose-50 rounded-2xl p-4">
                <div className="bg-brand-secondary text-white text-xs font-bold px-3 py-1 rounded-full mb-3 text-center">
                  SHREE AMBIKA BEAUTY SHOP
                </div>
                <p className="text-[10px] text-center text-gray-400 mb-3">(Our New Step)</p>
                {newShopPoints.map((p, i) => (
                  <div key={i} className="mb-3">
                    <p className="text-xs font-bold text-brand-secondary">{p.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-10 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-6 text-white text-sm">
            {[
              "100% ORIGINAL PRODUCTS",
              "BEST PRICES ALWAYS",
              "WIDE RANGE OF BRANDS",
              "SAFE & SECURE SHOPPING",
              "FAST & RELIABLE DELIVERY",
              "DEDICATED CUSTOMER SUPPORT",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <span className="text-brand-gold">✔</span>
                <span className="font-medium text-xs">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
