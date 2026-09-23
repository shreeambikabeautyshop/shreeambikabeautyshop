import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Beauty Shop near Kandivali Mumbai | Same Day Delivery | Shree Ambika — Est. 2001",
  description:
    "✅ 100% original beauty products delivered same-day to Kandivali East & West. Shree Ambika Beauty Shop, Dahisar East — 500+ brands, Lakme, Maybelline, SUGAR & more. 💬 WhatsApp Vinod: +91 82914 55297. Open 9AM–9PM, 7 days.",
  keywords: [
    "beauty shop near kandivali mumbai",
    "cosmetics delivery kandivali east",
    "beauty products kandivali west",
    "makeup shop near kandivali",
    "original cosmetics kandivali mumbai",
    "beauty products same day delivery kandivali",
    "shree ambika beauty shop kandivali",
    "best cosmetics shop kandivali",
    "skincare delivery kandivali",
    "hair care products kandivali mumbai",
    "lakme shop near kandivali",
    "sugar cosmetics kandivali delivery",
  ].join(", "),
  alternates: { canonical: "https://www.shreeambikabeauty.com/kandivali-beauty-shop" },
  openGraph: {
    title: "Beauty Shop near Kandivali Mumbai | Shree Ambika",
    description: "100% original beauty products delivered same-day to Kandivali from Shree Ambika Beauty Shop, Dahisar East. 500+ brands since 2001. WhatsApp: +918291455297",
    url: "https://www.shreeambikabeauty.com/kandivali-beauty-shop",
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store"],
  "@id": "https://www.shreeambikabeauty.com/kandivali-beauty-shop/#business",
  "name": "Shree Ambika Beauty Shop",
  "description": "Beauty shop serving Kandivali East and West with same-day delivery. 100% original beauty products from 500+ brands. Located in Dahisar East, 8-10km from Kandivali.",
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
    { "@type": "City", "name": "Kandivali East" },
    { "@type": "City", "name": "Kandivali West" },
    { "@type": "City", "name": "Borivali" },
    { "@type": "City", "name": "Dahisar East" },
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
      "name": "Is there a beauty shop near Kandivali Mumbai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Shree Ambika Beauty Shop in Dahisar East is just 8-10km from Kandivali and offers same-day delivery to both Kandivali East and Kandivali West. WhatsApp Vinod at +918291455297.",
      },
    },
    {
      "@type": "Question",
      "name": "Do you deliver beauty products to Kandivali same day?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Same-day delivery to Kandivali East and West. Order before 2 PM and receive your beauty products the same evening. WhatsApp: +918291455297.",
      },
    },
    {
      "@type": "Question",
      "name": "Where can I buy original SUGAR cosmetics near Kandivali?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Shree Ambika Beauty Shop stocks the complete SUGAR Cosmetics range — all 100% original. We deliver same-day to Kandivali. WhatsApp +918291455297 or visit shreeambikabeauty.com.",
      },
    },
    {
      "@type": "Question",
      "name": "What is the best cosmetics store near Kandivali station?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Shree Ambika Beauty Shop, established since 2001 in Dahisar East, is one of the most trusted beauty shops near Kandivali. 500+ brands, all original. Same-day home delivery so you don't need to travel. WhatsApp +918291455297.",
      },
    },
  ],
};

const nearbyAreas = [
  { area: "Kandivali East", distance: "8-9 km", note: "Same day delivery" },
  { area: "Kandivali West", distance: "9-10 km", note: "Same day delivery" },
  { area: "Borivali", distance: "5-8 km", note: "Same day delivery" },
  { area: "Dahisar East", distance: "0 km", note: "Store location" },
  { area: "Malad East", distance: "11-12 km", note: "Same day delivery" },
  { area: "Mira Road", distance: "10-12 km", note: "Same day delivery" },
];

const brands = [
  "Lakme", "Maybelline", "L'Oreal Paris", "SUGAR Cosmetics", "Wella", "Pilgrim",
  "Mamaearth", "Biotique", "Himalaya", "Neutrogena", "Garnier", "Cetaphil",
  "Plum", "Minimalist", "Dot & Key", "Streax", "Schwarzkopf", "Swiss Beauty",
  "Blue Heaven", "Colorbar", "Insight Professional", "Revlon",
];

export default function KandivaliBeautyShopPage() {
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
              <span>Beauty Shop near Kandivali Mumbai</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-3 leading-tight">
              Beauty Shop near Kandivali, Mumbai
            </h1>
            <p className="text-white/80 text-base mb-4 max-w-2xl">
              <strong>Shree Ambika Beauty Shop</strong> — just 8-10km from Kandivali.
              100% original beauty products from 500+ brands with same-day delivery to Kandivali East &amp; West.
              Trusted since 2001.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want beauty products delivered to Kandivali today."
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
              { emoji:"🚀", title:"Same Day", desc:"Delivery to Kandivali" },
              { emoji:"✅", title:"100% Original", desc:"No fakes, ever" },
              { emoji:"🏆", title:"Since 2001", desc:"25+ years trusted" },
              { emoji:"💄", title:"500+ Brands", desc:"Biggest selection" },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                <span className="text-3xl block mb-2">{c.emoji}</span>
                <p className="font-bold text-gray-900 text-sm">{c.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Store + Map */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">📍 Store Location — Serving Kandivali</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { icon:"🏪", label:"Store Name", value:"Shree Ambika Beauty Shop" },
                  { icon:"📍", label:"Address", value:"Shop No. 8, Ashapura Shopping Centre, Near Shanji Hotel, Anand Nagar, Dahisar East, Mumbai 400068" },
                  { icon:"🚇", label:"Nearest Metro", value:"Anand Nagar Metro Station, Dahisar East (Western Line)" },
                  { icon:"📏", label:"Distance from Kandivali", value:"8-10 km — 15-20 min drive" },
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
                  title="Shree Ambika Beauty Shop — Serving Kandivali Mumbai"
                />
              </div>
            </div>
          </div>

          {/* Delivery areas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delivery Areas Near Kandivali</h2>
            <p className="text-gray-500 text-sm mb-5">Order before 2 PM for same-day delivery. WhatsApp Vinod to confirm: +918291455297</p>
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Top Brands Available for Kandivali Delivery</h2>
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
                  q: "Is there same-day beauty product delivery in Kandivali?",
                  a: "Yes! Shree Ambika Beauty Shop delivers same-day to Kandivali East and West. Order before 2 PM. 500+ brands available. WhatsApp: +918291455297.",
                },
                {
                  q: "Where can I buy original Lakme products near Kandivali?",
                  a: "Shree Ambika Beauty Shop stocks the complete Lakme range — all 100% original. We deliver to Kandivali same day. WhatsApp +918291455297 or browse at shreeambikabeauty.com.",
                },
                {
                  q: "Do you deliver skincare products to Kandivali West?",
                  a: "Yes! We deliver all skincare products — Cetaphil, Minimalist, Plum, Pilgrim, Biotique, Mamaearth and more — to Kandivali West same day. WhatsApp Vinod: +918291455297.",
                },
                {
                  q: "How do I order from Shree Ambika Beauty Shop to Kandivali?",
                  a: "Simply WhatsApp Vinod at +918291455297 with your product name, quantity and Kandivali address. We'll confirm and deliver same day. Accept UPI, Cards, and COD.",
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
            <h2 className="font-bold text-2xl mb-2">Order Beauty Products to Kandivali Today</h2>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
              Same-day delivery to Kandivali East &amp; West.<br />
              Order before 2 PM — delivered same evening.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want beauty products delivered to Kandivali today."
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
