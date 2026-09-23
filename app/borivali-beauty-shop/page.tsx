import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Beauty Shop near Borivali Mumbai | Same Day Delivery | Shree Ambika — Est. 2001",
  description:
    "✅ 100% original beauty products delivered same-day to Borivali East & West from Shree Ambika Beauty Shop, Dahisar East. Lakme, Maybelline, SUGAR, L'Oréal & 500+ brands. 💬 WhatsApp Vinod: +91 82914 55297. Open 9AM–9PM, 7 days.",
  keywords: [
    "beauty shop near borivali mumbai",
    "cosmetics delivery borivali east",
    "beauty products borivali west",
    "makeup shop near borivali",
    "original cosmetics borivali mumbai",
    "lakme shop borivali",
    "beauty products same day delivery borivali",
    "shree ambika beauty shop borivali",
    "best beauty shop borivali mumbai",
    "hair care products borivali",
    "skincare delivery borivali",
    "sugar cosmetics borivali mumbai",
  ].join(", "),
  alternates: { canonical: "https://www.shreeambikabeauty.com/borivali-beauty-shop" },
  openGraph: {
    title: "Beauty Shop near Borivali Mumbai | Shree Ambika",
    description: "100% original beauty products delivered same-day to Borivali from Shree Ambika Beauty Shop, Dahisar East Mumbai since 2001. WhatsApp: +918291455297",
    url: "https://www.shreeambikabeauty.com/borivali-beauty-shop",
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store"],
  "@id": "https://www.shreeambikabeauty.com/borivali-beauty-shop/#business",
  "name": "Shree Ambika Beauty Shop",
  "description": "Beauty shop serving Borivali East and West with same-day delivery. 100% original cosmetics, makeup, skincare and haircare from 500+ brands. Located in Dahisar East, 5-8km from Borivali.",
  "url": "https://www.shreeambikabeauty.com",
  "telephone": "+918291455297",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Shop No. 8, Ashapura Shopping Centre, C S Complex, Road No. 2, Near Shanji Hotel, Anand Nagar",
    "addressLocality": "Dahisar East",
    "addressRegion": "Mumbai, Maharashtra",
    "postalCode": "400068",
    "addressCountry": "IN",
  },
  "geo": { "@type": "GeoCoordinates", "latitude": "19.2427", "longitude": "72.8651" },
  "openingHoursSpecification": [{
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
    "opens": "09:00", "closes": "21:00",
  }],
  "areaServed": [
    { "@type": "City", "name": "Borivali East" },
    { "@type": "City", "name": "Borivali West" },
    { "@type": "City", "name": "Dahisar East" },
    { "@type": "City", "name": "Dahisar West" },
    { "@type": "City", "name": "Mumbai" },
  ],
  "priceRange": "₹₹",
  "sameAs": ["https://instagram.com/shreeambikabeautyshop", "https://wa.me/918291455297"],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is there a beauty shop near Borivali Mumbai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Shree Ambika Beauty Shop in Dahisar East is just 5-8km from Borivali and offers same-day delivery to both Borivali East and Borivali West. Call or WhatsApp Vinod at +918291455297 to order.",
      },
    },
    {
      "@type": "Question",
      "name": "Do you deliver beauty products to Borivali same day?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Shree Ambika Beauty Shop offers same-day delivery to Borivali East and Borivali West. Order before 2 PM and receive your beauty products the same day. WhatsApp: +918291455297.",
      },
    },
    {
      "@type": "Question",
      "name": "Which brands are available for delivery in Borivali?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All 500+ brands available at Shree Ambika Beauty Shop can be delivered to Borivali — Lakme, Maybelline, SUGAR, L'Oreal, Wella, Pilgrim, Mamaearth, Cetaphil, Minimalist, Insight Professional and many more. All 100% original products.",
      },
    },
    {
      "@type": "Question",
      "name": "What is the nearest beauty shop to Borivali station?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Shree Ambika Beauty Shop is located near Anand Nagar Metro Station in Dahisar East, just 5-8km from Borivali station. We deliver to your door same-day so you don't need to travel. WhatsApp +918291455297.",
      },
    },
  ],
};

const nearbyAreas = [
  { area: "Borivali East", distance: "5-6 km", note: "Same day delivery" },
  { area: "Borivali West", distance: "7-8 km", note: "Same day delivery" },
  { area: "Dahisar East", distance: "0 km", note: "Store location" },
  { area: "Dahisar West", distance: "2-3 km", note: "Same day delivery" },
  { area: "Kandivali", distance: "8-10 km", note: "Same day delivery" },
  { area: "Mira Road", distance: "10-12 km", note: "Same day delivery" },
];

const brands = [
  "Lakme", "Maybelline", "L'Oreal Paris", "SUGAR Cosmetics", "Wella", "Pilgrim",
  "Mamaearth", "Biotique", "Himalaya", "Neutrogena", "Garnier", "Cetaphil",
  "Plum", "Minimalist", "Dot & Key", "Streax", "Schwarzkopf", "TRESemmé",
  "Swiss Beauty", "Blue Heaven", "Colorbar", "Insight Professional",
];

export default function BorivaliBeautyShopPage() {
  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-brand-primary text-white py-14 px-4">
          <div className="max-w-[1000px] mx-auto">
            <nav className="text-xs text-white/60 mb-4">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>Beauty Shop near Borivali Mumbai</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-3 leading-tight">
              Beauty Shop near Borivali, Mumbai
            </h1>
            <p className="text-white/80 text-base mb-4 max-w-2xl">
              <strong>Shree Ambika Beauty Shop</strong> — just 5-8km from Borivali.
              100% original beauty products from 500+ brands with same-day delivery to Borivali East &amp; West.
              Trusted since 2001.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want beauty products delivered to Borivali today."
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full text-sm transition-colors">
                💬 WhatsApp +91 82914 55297
              </a>
              <Link href="/products"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-full text-sm transition-colors">
                🛍 Browse All Products
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto px-4 py-12 space-y-10">

          {/* Trust signals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { emoji:"🚀", title:"Same Day", desc:"Delivery to Borivali" },
              { emoji:"✅", title:"100% Original", desc:"Authorized distributors only" },
              { emoji:"🏆", title:"Since 2001", desc:"25+ years of trust" },
              { emoji:"💄", title:"500+ Brands", desc:"All top beauty brands" },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                <span className="text-3xl block mb-2">{c.emoji}</span>
                <p className="font-bold text-gray-900 text-sm">{c.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* How delivery works */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">🚚 Same Day Delivery to Borivali</h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { step:"1", title:"WhatsApp Order", desc:"Message Vinod at +918291455297 with your product & address" },
                { step:"2", title:"Order Confirmed", desc:"Get confirmation within minutes. Order before 2 PM for same day." },
                { step:"3", title:"Delivered Today", desc:"Your beauty products at your Borivali doorstep same evening." },
              ].map(s => (
                <div key={s.step} className="flex gap-3 items-start">
                  <span className="w-8 h-8 rounded-full bg-brand-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{s.step}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{s.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="https://wa.me/918291455297?text=Hi Vinod! I want beauty products delivered to Borivali today."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full text-sm transition-colors">
              💬 Order Now on WhatsApp
            </a>
          </div>

          {/* Store location */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">📍 Store Location — Near Borivali</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { icon:"🏪", label:"Store Name", value:"Shree Ambika Beauty Shop" },
                  { icon:"📍", label:"Address", value:"Shop No. 8, Ashapura Shopping Centre, Near Shanji Hotel, Anand Nagar, Dahisar East, Mumbai 400068" },
                  { icon:"🚇", label:"Nearest Metro", value:"Anand Nagar Metro Station, Dahisar East (Western Line)" },
                  { icon:"📏", label:"Distance from Borivali", value:"5-8 km — 10-15 min drive" },
                  { icon:"🕐", label:"Store Hours", value:"Monday – Sunday: 9:00 AM – 9:00 PM" },
                  { icon:"📱", label:"WhatsApp", value:"+91 82914 55297 (Vinod)" },
                ].map(item => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
                      <p className="text-sm text-gray-800 font-medium mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15066.410426256421!2d72.86336324787312!3d19.25614340916139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b121454acea9%3A0xf9c45ee22136497e!2sShree%20Ambika%20Beauty%20Shop!5e0!3m2!1sen!2sin!4v1785062101260!5m2!1sen!2sin"
                  width="100%" height="280" style={{ border: 0 }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Shree Ambika Beauty Shop — Near Borivali Mumbai"
                />
              </div>
            </div>
          </div>

          {/* Delivery areas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delivery Areas Near Borivali</h2>
            <p className="text-gray-500 text-sm mb-5">
              We deliver to all areas around Borivali and Dahisar. Order before 2 PM for same-day delivery.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {nearbyAreas.map(area => (
                <div key={area.area} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="font-bold text-gray-800 text-sm">{area.area}</p>
                  <p className="text-xs text-green-600 font-semibold">{area.distance}</p>
                  <p className="text-[10px] text-gray-400">{area.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">500+ Brands Available for Delivery in Borivali</h2>
            <p className="text-gray-500 text-sm mb-5">All 100% original, sourced from authorized distributors.</p>
            <div className="flex flex-wrap gap-2">
              {brands.map(brand => (
                <span key={brand} className="bg-brand-light text-brand-primary text-xs font-bold px-3 py-1.5 rounded-full border border-brand-primary/20">
                  {brand}
                </span>
              ))}
              <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full">+ 478 more brands</span>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Is there a beauty shop near Borivali Mumbai with same day delivery?",
                  a: "Yes! Shree Ambika Beauty Shop in Dahisar East is 5-8km from Borivali and offers same-day delivery to both Borivali East and Borivali West. Order before 2 PM. WhatsApp Vinod at +918291455297.",
                },
                {
                  q: "Which is the best cosmetics shop near Borivali?",
                  a: "Shree Ambika Beauty Shop, established in 2001, is one of the most trusted beauty shops near Borivali. We stock 500+ brands — all 100% original from authorized distributors. Same-day delivery to Borivali. Visit shreeambikabeauty.com.",
                },
                {
                  q: "Do you deliver Lakme and Maybelline products to Borivali?",
                  a: "Yes! We stock the complete range of Lakme, Maybelline, SUGAR, L'Oreal and 500+ other brands. All 100% original. Same-day delivery to Borivali. WhatsApp +918291455297.",
                },
                {
                  q: "How long does delivery take to Borivali from Dahisar?",
                  a: "Borivali is just 5-8km from our shop. Orders placed before 2 PM are typically delivered the same evening. WhatsApp Vinod at +918291455297 for exact delivery time.",
                },
              ].map((faq, i) => (
                <div key={i} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <h3 className="font-bold text-gray-800 text-sm mb-1.5">{faq.q}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-brand-primary rounded-3xl p-8 text-center text-white">
            <h2 className="font-bold text-2xl mb-2">Order Beauty Products to Borivali Today</h2>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
              Same-day delivery to Borivali East &amp; West.<br />
              Order before 2 PM — delivered same evening.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want beauty products delivered to Borivali today."
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-full transition-colors">
                💬 WhatsApp to Order
              </a>
              <Link href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-primary font-bold px-8 py-3.5 rounded-full hover:bg-brand-light transition-colors">
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
