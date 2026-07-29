import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Beauty Shop in Dahisar East Mumbai | Cosmetics Store Near Anand Nagar Metro | Shree Ambika",
  description:
    "Shree Ambika Beauty Shop — Dahisar East Mumbai's most trusted beauty & cosmetics store since 2001. Near Anand Nagar Metro Station. Buy 100% original Lakme, Maybelline, SUGAR, L'Oreal, Insight, Mars. Same day delivery. WhatsApp +918291455297",
  keywords: [
    "beauty shop dahisar east mumbai",
    "cosmetics shop dahisar",
    "beauty shop near anand nagar metro",
    "original beauty products dahisar mumbai",
    "lakme shop dahisar east",
    "makeup shop near me dahisar",
    "beauty products dahisar mumbai",
    "shree ambika beauty shop",
    "cosmetics store dahisar east",
    "beauty shop near borivali",
    "original cosmetics mumbai same day delivery",
    "insight cosmetics dahisar",
    "swiss beauty products mumbai",
    "wella hair products dahisar",
  ].join(", "),
  alternates: { canonical: "https://www.shreeambikabeauty.com/dahisar-beauty-shop" },
  openGraph: {
    title: "Beauty Shop in Dahisar East Mumbai | Shree Ambika",
    description: "100% original beauty products in Dahisar East Mumbai since 2001. Lakme, Maybelline, SUGAR & 500+ brands. Same day delivery. WhatsApp: +918291455297",
    url: "https://www.shreeambikabeauty.com/dahisar-beauty-shop",
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store"],
  "@id": "https://www.shreeambikabeauty.com/dahisar-beauty-shop/#business",
  "name": "Shree Ambika Beauty Shop",
  "description": "Dahisar East Mumbai's most trusted beauty shop since 2001. 100% original cosmetics, makeup, skincare and haircare from 500+ brands. Same day delivery in Mumbai.",
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
  "priceRange": "₹₹",
  "servesCuisine": null,
  "areaServed": [
    { "@type": "City", "name": "Dahisar East" },
    { "@type": "City", "name": "Borivali" },
    { "@type": "City", "name": "Kandivali" },
    { "@type": "City", "name": "Malad" },
    { "@type": "City", "name": "Mumbai" },
  ],
  "hasMap": "https://maps.google.com/?q=Shop+No+8+Chhatrapati+Shivaji+Rd+Number+2+Jaya+Nagar+Dahisar+East+Mumbai+400068",
  "sameAs": [
    "https://instagram.com/shreeambikabeautyshop",
    "https://wa.me/918291455297",
  ],
};

const nearbyAreas = [
  { area: "Dahisar West", distance: "5 min", note: "Same day delivery available" },
  { area: "Borivali East", distance: "10 min", note: "Same day delivery available" },
  { area: "Borivali West", distance: "12 min", note: "Same day delivery available" },
  { area: "Kandivali East", distance: "15 min", note: "Same day delivery available" },
  { area: "Mira Road", distance: "15 min", note: "Same day delivery available" },
  { area: "Thane", distance: "30 min", note: "Express delivery available" },
  { area: "Andheri", distance: "35 min", note: "Pan Mumbai delivery" },
];

const brands = [
  "Lakme", "Maybelline", "L'Oreal Paris", "SUGAR Cosmetics", "Wella", "Pilgrim",
  "Mamaearth", "Biotique", "Himalaya", "Neutrogena", "Garnier", "Cetaphil",
  "Plum", "Minimalist", "Dot & Key", "Streax", "Schwarzkopf", "TRESemmé",
  "Swiss Beauty", "Blue Heaven", "Colorbar", "Revlon",
];

export default function DahisarBeautyShopPage() {
  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <main className="min-h-screen bg-gray-50">

        {/* Hero — hyperlocal H1 */}
        <div className="bg-brand-primary text-white py-14 px-4">
          <div className="max-w-[1000px] mx-auto">
            <nav className="text-xs text-white/60 mb-4">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>Beauty Shop in Dahisar East Mumbai</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-3 leading-tight">
              Beauty Shop in Dahisar East, Mumbai
            </h1>
            <p className="text-white/80 text-base mb-4 max-w-2xl">
              <strong>Shree Ambika Beauty Shop</strong> — Dahisar East&apos;s most trusted beauty store since 2001.
              100% original cosmetics, makeup, skincare & haircare from 500+ brands.
              Same-day delivery across Mumbai.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want to order beauty products."
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

          {/* Why us — trust signals */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { emoji:"🏆", title:"Since 2001", desc:"24+ years of trust in Dahisar" },
              { emoji:"✅", title:"100% Original", desc:"From authorized distributors only" },
              { emoji:"🚀", title:"Same Day", desc:"Delivery within Mumbai" },
              { emoji:"💄", title:"500+ Brands", desc:"Largest selection in Dahisar" },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                <span className="text-3xl block mb-2">{c.emoji}</span>
                <p className="font-bold text-gray-900 text-sm">{c.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Store location — SEO rich content */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">📍 Find Us in Dahisar East</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { icon:"🏪", label:"Store Name", value:"Shree Ambika Beauty Shop (Shree Ambika Choice Center)" },
                  { icon:"📍", label:"Address", value:"Shop No. 8, Ashapura Shopping Centre, C S Complex, Road No. 2, Near Shanji Hotel, Anand Nagar, Dahisar East, Mumbai 400068" },
                  { icon:"🚇", label:"Nearest Metro", value:"Anand Nagar Metro Station, Dahisar East (Western Line)" },
                  { icon:"🕐", label:"Store Hours", value:"Monday – Sunday: 9:00 AM – 10:00 PM (Open 365 days, closed only Holi & Election Day)" },
                  { icon:"📱", label:"WhatsApp", value:"+91 82914 55297 (Vinod)" },
                  { icon:"🌐", label:"Website", value:"shreeambikabeauty.com" },
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
                  title="Shree Ambika Beauty Shop location — Dahisar East Mumbai"
                />
              </div>
            </div>
          </div>

          {/* Brands — keyword rich */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">500+ Brands Available in Dahisar</h2>
            <p className="text-gray-500 text-sm mb-5">
              We stock India&apos;s top beauty brands — 100% original, sourced directly from authorized distributors.
              From Lakme to SUGAR, Wella to Pilgrim — everything under one roof in Dahisar East, Mumbai.
            </p>
            <div className="flex flex-wrap gap-2">
              {brands.map(brand => (
                <span key={brand} className="bg-brand-light text-brand-primary text-xs font-bold px-3 py-1.5 rounded-full border border-brand-primary/20">
                  {brand}
                </span>
              ))}
              <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full">
                + 478 more brands
              </span>
            </div>
          </div>

          {/* Nearby delivery — hyperlocal SEO */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delivery Near Dahisar East</h2>
            <p className="text-gray-500 text-sm mb-5">
              We deliver beauty products to all areas near Dahisar East, Mumbai — same day for most locations.
              Order before 2 PM for same-day delivery. WhatsApp Vinod to confirm: +918291455297
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {nearbyAreas.map(area => (
                <div key={area.area} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="font-bold text-gray-800 text-sm">{area.area}</p>
                  <p className="text-xs text-green-600 font-semibold">{area.distance}</p>
                  <p className="text-[10px] text-gray-400">{area.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ for AEO */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {
                  q: "Where is Shree Ambika Beauty Shop located in Dahisar?",
                  a: "Shree Ambika Beauty Shop is located at Shop No. 8, Chhatrapati Shivaji Rd Number 2, Jaya Nagar, Near Shanji Hotel, Dahisar East, Mumbai 400068. The store is near Anand Nagar Metro Station on the Western Line.",
                },
                {
                  q: "Are the beauty products at Shree Ambika 100% original?",
                  a: "Yes, absolutely. Every product at Shree Ambika Beauty Shop is 100% original and sourced directly from authorized brand distributors. We have been in business since 2001 and our reputation is built entirely on authenticity.",
                },
                {
                  q: "Do you offer same-day delivery in Dahisar?",
                  a: "Yes! We offer same-day delivery in Dahisar East, Dahisar West, Borivali, Kandivali, and nearby areas for orders placed before 2 PM. WhatsApp Vinod at +918291455297 to place your order.",
                },
                {
                  q: "What beauty brands are available at this shop in Dahisar?",
                  a: "We stock 500+ brands including Lakme, Maybelline, L'Oreal, SUGAR Cosmetics, Wella, Pilgrim, Mamaearth, Biotique, Himalaya, Neutrogena, Garnier, Cetaphil, Plum, Minimalist, Streax, Schwarzkopf, Swiss Beauty, and many more.",
                },
                {
                  q: "How do I order from Shree Ambika Beauty Shop?",
                  a: "Simply WhatsApp Vinod at +918291455297. Browse our products at shreeambikabeauty.com, then WhatsApp your order with product name and quantity. We accept UPI, cards, and Cash on Delivery.",
                },
                {
                  q: "Is Shree Ambika Beauty Shop the best beauty shop near Dahisar East Metro?",
                  a: "Shree Ambika Beauty Shop is located right near Anand Nagar Metro Station, Dahisar East. With 24+ years of experience and 500+ original brands, it is one of the most trusted beauty shops in the Dahisar and Borivali area.",
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
            <h2 className="font-bold text-2xl mb-2">Visit or Order Online Today</h2>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
              Shop No. 8, Near Anand Nagar Metro, Dahisar East, Mumbai 400068<br/>
              Open 9 AM – 9 PM, 7 days a week
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want to order from your Dahisar shop."
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-full transition-colors">
                💬 WhatsApp to Order
              </a>
              <Link href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-primary font-bold px-8 py-3.5 rounded-full hover:bg-brand-light transition-colors">
                🛍 Browse Products Online
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
