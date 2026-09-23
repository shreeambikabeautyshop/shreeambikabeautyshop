import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Beauty Products Delivery Malad Mumbai | Same Day | Shree Ambika — Est. 2001",
  description:
    "✅ 100% original beauty products delivered same-day to Malad East & West. Shree Ambika Beauty Shop, Dahisar East Mumbai — 500+ brands, Lakme, SUGAR, L'Oréal & more. 💬 WhatsApp Vinod: +91 82914 55297. Open 9AM–9PM, 7 days.",
  keywords: [
    "beauty products delivery malad mumbai",
    "beauty shop near malad east",
    "cosmetics delivery malad west",
    "same day beauty delivery malad",
    "original cosmetics malad mumbai",
    "lakme delivery malad",
    "makeup products malad same day",
    "shree ambika beauty malad",
    "best cosmetics delivery malad",
    "skincare delivery malad east west",
    "hair care products malad delivery",
    "sugar cosmetics malad mumbai",
  ].join(", "),
  alternates: { canonical: "https://www.shreeambikabeauty.com/malad-beauty-shop" },
  openGraph: {
    title: "Beauty Products Delivery Malad Mumbai | Shree Ambika Beauty Shop",
    description: "100% original beauty products delivered same-day to Malad East & West. 500+ brands from Shree Ambika Beauty Shop, Dahisar Mumbai. WhatsApp: +918291455297",
    url: "https://www.shreeambikabeauty.com/malad-beauty-shop",
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store"],
  "@id": "https://www.shreeambikabeauty.com/malad-beauty-shop/#business",
  "name": "Shree Ambika Beauty Shop",
  "description": "Beauty shop offering same-day delivery to Malad East and Malad West. 100% original beauty products from 500+ brands. Located in Dahisar East, 11-13km from Malad.",
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
    { "@type": "City", "name": "Malad East" },
    { "@type": "City", "name": "Malad West" },
    { "@type": "City", "name": "Kandivali" },
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
      "name": "Do you deliver beauty products to Malad same day?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Shree Ambika Beauty Shop delivers same-day to Malad East and Malad West. Order before 2 PM. 500+ brands available. WhatsApp: +918291455297.",
      },
    },
    {
      "@type": "Question",
      "name": "Which beauty shop delivers to Malad Mumbai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Shree Ambika Beauty Shop in Dahisar East delivers same-day to Malad. Trusted since 2001, 500+ brands all 100% original. WhatsApp +918291455297 or visit shreeambikabeauty.com.",
      },
    },
    {
      "@type": "Question",
      "name": "Can I get Mamaearth or Plum products delivered to Malad?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! We stock Mamaearth, Plum, Minimalist, Pilgrim, Dot & Key and all popular natural skincare brands. All 100% original. Same-day delivery to Malad. WhatsApp +918291455297.",
      },
    },
    {
      "@type": "Question",
      "name": "Is there free delivery to Malad from Shree Ambika Beauty Shop?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Free delivery is available on orders above Rs.999 to Malad. WhatsApp Vinod at +918291455297 for exact delivery charges on smaller orders.",
      },
    },
  ],
};

const nearbyAreas = [
  { area: "Malad East", distance: "11-12 km", note: "Same day delivery" },
  { area: "Malad West", distance: "12-13 km", note: "Same day delivery" },
  { area: "Kandivali East", distance: "8-9 km", note: "Same day delivery" },
  { area: "Kandivali West", distance: "9-10 km", note: "Same day delivery" },
  { area: "Borivali", distance: "5-8 km", note: "Same day delivery" },
  { area: "Dahisar East", distance: "0 km", note: "Store location" },
];

const brands = [
  "Lakme", "Maybelline", "L'Oreal Paris", "SUGAR Cosmetics", "Wella", "Pilgrim",
  "Mamaearth", "Biotique", "Himalaya", "Neutrogena", "Garnier", "Cetaphil",
  "Plum", "Minimalist", "Dot & Key", "Streax", "Schwarzkopf", "Swiss Beauty",
  "Blue Heaven", "Colorbar", "Insight Professional", "Revlon",
];

export default function MaladBeautyShopPage() {
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
              <span>Beauty Products Delivery Malad Mumbai</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-3 leading-tight">
              Beauty Products Delivery — Malad East &amp; West, Mumbai
            </h1>
            <p className="text-white/80 text-base mb-4 max-w-2xl">
              <strong>Shree Ambika Beauty Shop</strong> delivers 100% original beauty products
              same-day to Malad East &amp; West. 500+ top brands. Trusted since 2001.
              Order on WhatsApp — delivered to your door.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want beauty products delivered to Malad today."
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
              { emoji:"🚀", title:"Same Day", desc:"Delivery to Malad" },
              { emoji:"✅", title:"100% Original", desc:"Authorized brands only" },
              { emoji:"🚚", title:"Free Delivery", desc:"On orders above ₹999" },
              { emoji:"💄", title:"500+ Brands", desc:"Every top brand available" },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                <span className="text-3xl block mb-2">{c.emoji}</span>
                <p className="font-bold text-gray-900 text-sm">{c.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* Store info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">📍 About Our Shop — Delivering to Malad</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { icon:"🏪", label:"Store Name", value:"Shree Ambika Beauty Shop" },
                  { icon:"📍", label:"Address", value:"Shop No. 8, Ashapura Shopping Centre, Near Shanji Hotel, Anand Nagar, Dahisar East, Mumbai 400068" },
                  { icon:"🚇", label:"Nearest Metro", value:"Anand Nagar Metro Station, Dahisar East (Western Line)" },
                  { icon:"📏", label:"Distance from Malad", value:"11-13 km — 20-25 min drive" },
                  { icon:"🕐", label:"Store Hours", value:"Monday – Sunday: 9:00 AM – 9:00 PM" },
                  { icon:"📱", label:"WhatsApp Order", value:"+91 82914 55297 (Vinod)" },
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
                  title="Shree Ambika Beauty Shop — Delivering to Malad Mumbai"
                />
              </div>
            </div>
          </div>

          {/* Delivery areas */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delivery Coverage — Malad &amp; Nearby</h2>
            <p className="text-gray-500 text-sm mb-5">Order before 2 PM for same-day delivery to Malad.</p>
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">Top Brands Delivered to Malad</h2>
            <p className="text-gray-500 text-sm mb-5">All 100% original, sourced from authorized distributors only.</p>
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
                  q: "Which beauty shop delivers same day to Malad Mumbai?",
                  a: "Shree Ambika Beauty Shop in Dahisar East delivers same-day to Malad East and Malad West. Order before 2 PM. 500+ original brands. WhatsApp: +918291455297.",
                },
                {
                  q: "Do you deliver Wella and Schwarzkopf hair products to Malad?",
                  a: "Yes! Complete Wella, Schwarzkopf, TRESemmé, Streax haircare range delivered to Malad same day. All 100% original. WhatsApp +918291455297.",
                },
                {
                  q: "Is free delivery available to Malad?",
                  a: "Free delivery is available on orders above Rs.999. For smaller orders, WhatsApp Vinod at +918291455297 for delivery charges to your Malad address.",
                },
                {
                  q: "How do I order beauty products to Malad from Shree Ambika?",
                  a: "WhatsApp Vinod at +918291455297 with your product choice and Malad address. Or browse shreeambikabeauty.com and WhatsApp your cart. Same-day delivery, COD available.",
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
            <h2 className="font-bold text-2xl mb-2">Order Beauty Products to Malad Today</h2>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
              Same-day delivery to Malad East &amp; West.<br />
              Free delivery on orders above ₹999 • COD available
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://wa.me/918291455297?text=Hi Vinod! I want beauty products delivered to Malad today."
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
