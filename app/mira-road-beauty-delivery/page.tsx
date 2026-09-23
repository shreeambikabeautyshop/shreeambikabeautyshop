import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Beauty Products Delivery Mira Road | Same Day | Shree Ambika Beauty Shop Mumbai",
  description:
    "✅ 100% original beauty products delivered same-day to Mira Road & Bhayandar. Shree Ambika Beauty Shop, Dahisar East Mumbai — 500+ brands. 💬 WhatsApp Vinod: +91 82914 55297. Open 9AM–9PM, 7 days.",
  keywords: [
    "beauty products delivery mira road",
    "cosmetics delivery mira road bhayandar",
    "beauty shop near mira road",
    "same day beauty delivery mira road mumbai",
    "original cosmetics mira road",
    "lakme delivery mira road",
    "makeup products mira road",
    "beauty products bhayandar delivery",
    "shree ambika beauty mira road",
    "skincare delivery mira road",
    "hair care products mira road delivery",
    "whatsapp beauty order mira road",
  ].join(", "),
  alternates: { canonical: "https://www.shreeambikabeauty.com/mira-road-beauty-delivery" },
  openGraph: {
    title: "Beauty Products Delivery Mira Road | Shree Ambika Beauty Shop",
    description: "100% original beauty products delivered same-day to Mira Road & Bhayandar. 500+ brands from Shree Ambika Beauty Shop. WhatsApp: +918291455297",
    url: "https://www.shreeambikabeauty.com/mira-road-beauty-delivery",
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store"],
  "@id": "https://www.shreeambikabeauty.com/mira-road-beauty-delivery/#business",
  "name": "Shree Ambika Beauty Shop",
  "description": "Beauty shop offering same-day delivery to Mira Road and Bhayandar. 100% original beauty products from 500+ brands. Located in Dahisar East Mumbai, 10-12km from Mira Road.",
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
    { "@type": "City", "name": "Mira Road" },
    { "@type": "City", "name": "Bhayandar" },
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
      "name": "Do you deliver beauty products to Mira Road same day?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Shree Ambika Beauty Shop delivers same-day to Mira Road and Bhayandar. Order before 2 PM. WhatsApp Vinod at +918291455297 to place your order.",
      },
    },
    {
      "@type": "Question",
      "name": "Which beauty shop delivers to Mira Road from Mumbai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Shree Ambika Beauty Shop in Dahisar East, Mumbai delivers same-day to Mira Road. 500+ brands, all 100% original. WhatsApp +918291455297 or order at shreeambikabeauty.com.",
      },
    },
    {
      "@type": "Question",
      "name": "Is cash on delivery available for Mira Road orders?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! COD is available for delivery to Mira Road. We also accept UPI, GPay, PhonePe, and Credit/Debit Cards. WhatsApp Vinod at +918291455297 to confirm.",
      },
    },
    {
      "@type": "Question",
      "name": "How long does delivery take to Mira Road?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Mira Road is 10-12km from our Dahisar East shop. Orders placed before 2 PM are typically delivered the same evening. WhatsApp +918291455297 for exact delivery time.",
      },
    },
  ],
};

const nearbyAreas = [
  { area: "Mira Road East", distance: "10-11 km", note: "Same day delivery" },
  { area: "Mira Road West", distance: "11-12 km", note: "Same day delivery" },
  { area: "Bhayandar East", distance: "11-12 km", note: "Same day delivery" },
  { area: "Bhayandar West", distance: "12-13 km", note: "Same day delivery" },
  { area: "Dahisar East", distance: "0 km", note: "Store location" },
  { area: "Borivali", distance: "5-8 km", note: "Same day delivery" },
];

const brands = [
  "Lakme", "Maybelline", "L'Oreal Paris", "SUGAR Cosmetics", "Wella", "Pilgrim",
  "Mamaearth", "Biotique", "Himalaya", "Neutrogena", "Garnier", "Cetaphil",
  "Plum", "Minimalist", "Dot & Key", "Streax", "Schwarzkopf", "Swiss Beauty",
  "Blue Heaven", "Colorbar", "Insight Professional", "TRESemmé",
];

export default function MiraRoadBeautyDeliveryPage() {
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
              <span>Beauty Products Delivery Mira Road</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-3 leading-tight">
              Beauty Products Delivery — Mira Road &amp; Bhayandar
            </h1>
            <p className="text-white/80 text-base mb-4 max-w-2xl">
              <strong>Shree Ambika Beauty Shop</strong> delivers 100% original beauty products
              same-day to Mira Road and Bhayandar. 500+ brands, trusted since 2001.
              Order on WhatsApp before 2 PM — delivered same evening.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want beauty products delivered to Mira Road today."
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
              { emoji:"🚀", title:"Same Day", desc:"Delivery to Mira Road" },
              { emoji:"✅", title:"100% Original", desc:"No fakes, guaranteed" },
              { emoji:"💰", title:"COD Available", desc:"Pay on delivery" },
              { emoji:"💄", title:"500+ Brands", desc:"All top beauty brands" },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                <span className="text-3xl block mb-2">{c.emoji}</span>
                <p className="font-bold text-gray-900 text-sm">{c.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* How to order */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">🚚 How to Get Beauty Products Delivered to Mira Road</h2>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { step:"1", title:"Browse Products", desc:"Visit shreeambikabeauty.com — 500+ products from top brands" },
                { step:"2", title:"WhatsApp Order", desc:"Message Vinod at +918291455297 with product name + Mira Road address" },
                { step:"3", title:"Same Day Delivery", desc:"Order before 2 PM = delivered same evening to your Mira Road address" },
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
            <div className="bg-gray-50 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
              <div>
                <p className="font-bold text-gray-800 text-sm">Payment Options for Mira Road Orders</p>
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {["UPI", "GPay", "PhonePe", "Credit Card", "COD", "Cash"].map(p => (
                    <span key={p} className="bg-white border border-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-lg">{p}</span>
                  ))}
                </div>
              </div>
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want beauty products delivered to Mira Road today."
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-5 py-2.5 rounded-full text-sm transition-colors whitespace-nowrap">
                💬 Order Now
              </a>
            </div>
          </div>

          {/* Delivery areas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delivery Areas — Mira Road &amp; Nearby</h2>
            <p className="text-gray-500 text-sm mb-5">Order before 2 PM for same-day delivery. WhatsApp to confirm: +918291455297</p>
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Top Brands Delivered to Mira Road</h2>
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
                  q: "Which beauty shop delivers to Mira Road same day in Mumbai?",
                  a: "Shree Ambika Beauty Shop in Dahisar East delivers same-day to Mira Road and Bhayandar. 500+ original brands. Order before 2 PM. WhatsApp: +918291455297.",
                },
                {
                  q: "Is COD available for beauty product delivery to Mira Road?",
                  a: "Yes! Cash on Delivery is available for Mira Road orders. We also accept UPI, GPay, PhonePe, and cards. WhatsApp Vinod: +918291455297.",
                },
                {
                  q: "Can I get Minimalist or Cetaphil delivered to Mira Road?",
                  a: "Yes! We stock Minimalist, Cetaphil, Plum, Pilgrim, Mamaearth and all popular skincare brands. All 100% original. Same-day delivery to Mira Road. WhatsApp +918291455297.",
                },
                {
                  q: "Do you deliver hair care products to Bhayandar?",
                  a: "Yes! Wella, Schwarzkopf, TRESemmé, Streax, L'Oreal and all hair care brands delivered to Bhayandar same day. WhatsApp +918291455297 or browse shreeambikabeauty.com.",
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
            <h2 className="font-bold text-2xl mb-2">Order Beauty Products to Mira Road Today</h2>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
              Same-day delivery to Mira Road &amp; Bhayandar.<br />
              100% original • COD available • 500+ brands
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want beauty products delivered to Mira Road today."
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
