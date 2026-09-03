import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Cosmetic Shop Near Me in Mumbai | Beauty Store Dahisar | Shree Ambika — Est. 2001",
  description:
    "Looking for a cosmetic shop near you in Mumbai? Shree Ambika Beauty Shop — Dahisar East, near Anand Nagar Metro. 500+ original brands. Same-day delivery across Mumbai. Open 9AM–10PM, 7 days. WhatsApp: +91 82914 55297",
  keywords: [
    "cosmetic shop near me mumbai",
    "beauty store near me dahisar",
    "makeup shop near me mumbai",
    "cosmetics shop near me borivali",
    "beauty products shop near me",
    "nearby makeup shop mumbai",
    "cosmetic dukaan mumbai",
    "beauty shop near anand nagar metro",
    "original cosmetics shop mumbai",
    "beauty accessories shop near me",
    "skin care products shop near me",
  ].join(", "),
  alternates: { canonical: "https://www.shreeambikabeauty.com/cosmetic-shop-mumbai" },
  openGraph: {
    title: "Cosmetic Shop Near Me in Mumbai | Shree Ambika Beauty Shop Dahisar",
    description:
      "Shree Ambika Beauty Shop — Mumbai's most trusted cosmetics store near Anand Nagar Metro, Dahisar East. 500+ brands, 100% original. Same-day delivery. WhatsApp +918291455297",
    url: "https://www.shreeambikabeauty.com/cosmetic-shop-mumbai",
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "Store", "BeautySalon"],
  "@id": "https://www.shreeambikabeauty.com/cosmetic-shop-mumbai/#business",
  "name": "Shree Ambika Beauty Shop — Cosmetic Shop in Mumbai",
  "description":
    "Mumbai's nearest cosmetic shop near Anand Nagar Metro, Dahisar East. 100% original beauty products from 500+ brands. Same-day delivery. Est. 2001.",
  "url": "https://www.shreeambikabeauty.com",
  "telephone": "+918291455297",
  "address": {
    "@type": "PostalAddress",
    "streetAddress":
      "Shop No. 8, Ashapura Shopping Centre, C S Complex, Road No. 2, Near Shanji Hotel, Anand Nagar",
    "addressLocality": "Dahisar East",
    "addressRegion": "Mumbai, Maharashtra",
    "postalCode": "400068",
    "addressCountry": "IN",
  },
  "geo": { "@type": "GeoCoordinates", "latitude": "19.2427", "longitude": "72.8651" },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
      ],
      "opens": "09:00",
      "closes": "22:00",
    },
  ],
  "priceRange": "₹₹",
  "areaServed": [
    { "@type": "City", "name": "Dahisar" },
    { "@type": "City", "name": "Borivali" },
    { "@type": "City", "name": "Kandivali" },
    { "@type": "City", "name": "Malad" },
    { "@type": "City", "name": "Andheri" },
    { "@type": "City", "name": "Mumbai" },
  ],
  "hasMap":
    "https://maps.google.com/?q=Shree+Ambika+Beauty+Shop+Dahisar+East+Mumbai",
};

const nearbyAreas = [
  { area: "Dahisar East", time: "0 min", tag: "At store" },
  { area: "Dahisar West", time: "5 min", tag: "Same-day delivery" },
  { area: "Borivali East", time: "10 min", tag: "Same-day delivery" },
  { area: "Borivali West", time: "12 min", tag: "Same-day delivery" },
  { area: "Kandivali East", time: "15 min", tag: "Same-day delivery" },
  { area: "Kandivali West", time: "18 min", tag: "Same-day delivery" },
  { area: "Mira Road", time: "15 min", tag: "Same-day delivery" },
  { area: "Malad", time: "20 min", tag: "Same-day delivery" },
  { area: "Thane", time: "30 min", tag: "Express delivery" },
  { area: "Navi Mumbai", time: "40 min", tag: "Express delivery" },
  { area: "Andheri", time: "35 min", tag: "Pan Mumbai delivery" },
  { area: "All other cities", time: "4–7 days", tag: "Pan India courier" },
];

const productCategories = [
  { emoji: "💄", name: "Cosmetics & Lipsticks", brands: "Lakme, Maybelline, SUGAR, Colorbar, Revlon" },
  { emoji: "🎨", name: "Makeup & Brushes", brands: "Insight, Swiss Beauty, 6MARS, Blue Heaven" },
  { emoji: "✨", name: "Skincare & Serums", brands: "Pilgrim, Minimalist, Mamaearth, Cetaphil, Neutrogena" },
  { emoji: "💆", name: "Haircare & Shampoos", brands: "L'Oréal, Wella, Streax, Schwarzkopf, TRESemmé" },
  { emoji: "🌸", name: "Perfumes & Deodorants", brands: "Fogg, Park Avenue, Wild Stone, AXE" },
  { emoji: "🧴", name: "Body Care & Lotions", brands: "Biotique, Himalaya, Vaseline, Nivea, Dove" },
  { emoji: "💅", name: "Nail & Accessories", brands: "Insight, Swiss Beauty, OPI, Blue Heaven" },
  { emoji: "⚡", name: "Electronics & Tools", brands: "Hair dryers, straighteners, curlers, massagers" },
];

const faqs = [
  {
    q: "Where is the nearest cosmetic shop to me in Mumbai?",
    a: "Shree Ambika Beauty Shop is located near Anand Nagar Metro Station, Dahisar East, Mumbai 400068. It serves customers from Dahisar, Borivali, Kandivali, Malad, and all of Mumbai. The shop is open 9AM–10PM, 7 days a week. You can also order online via WhatsApp +918291455297 for same-day home delivery.",
  },
  {
    q: "Is there a beauty store near me that delivers the same day in Mumbai?",
    a: "Yes! Shree Ambika Beauty Shop offers same-day delivery across Mumbai for orders placed before 12 PM. WhatsApp Vinod at +918291455297 with your order and address — your products will be delivered the same evening.",
  },
  {
    q: "Which is the best cosmetic shop near Dahisar, Borivali, or Kandivali?",
    a: "Shree Ambika Beauty Shop in Dahisar East is the top-rated cosmetics store serving Dahisar, Borivali, Kandivali, and nearby areas. With 24+ years of experience, 500+ brands, and 100% original products, it is the most trusted beauty shop in the western suburbs of Mumbai.",
  },
  {
    q: "Are the products at this cosmetic shop 100% original?",
    a: "Absolutely. Every product at Shree Ambika Beauty Shop is 100% original, sourced directly from authorized brand distributors. We have been in business since 2001 and never stock duplicate or counterfeit products.",
  },
  {
    q: "Can I order from this beauty shop online?",
    a: "Yes! Browse our full catalogue at shreeambikabeauty.com and place your order via WhatsApp at +918291455297. We accept UPI, GPay, PhonePe, cards, and cash on delivery (COD).",
  },
  {
    q: "What are the store timings of this cosmetic shop in Mumbai?",
    a: "Shree Ambika Beauty Shop is open Monday to Sunday, 9:00 AM to 10:00 PM — 365 days a year (closed only on Holi and Election Day). Located near Anand Nagar Metro Station, Dahisar East, Mumbai.",
  },
];

export default function CosmeticShopMumbaiPage() {
  return (
    <>
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ── */}
        <section className="bg-brand-primary text-white py-14 px-4">
          <div className="max-w-[1000px] mx-auto">
            <nav className="text-xs text-white/60 mb-4 flex items-center gap-1">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>›</span>
              <span>Cosmetic Shop in Mumbai</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-3 leading-tight">
              Cosmetic Shop Near You in Mumbai
            </h1>
            <p className="text-white/85 text-base mb-2 max-w-2xl">
              <strong>Shree Ambika Beauty Shop</strong> — Mumbai&apos;s most trusted cosmetics store since 2001.
              Near Anand Nagar Metro, Dahisar East. 500+ original brands. Open 9AM–10PM daily.
            </p>
            <p className="text-white/70 text-sm mb-6">
              📍 Dahisar East · ⚡ Same-day delivery Mumbai · 🚚 Pan India · 📦 COD available
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://wa.me/918291455297?text=Hi Vinod! I am looking for a cosmetic shop near me in Mumbai. Please help."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full text-sm transition-colors"
              >
                💬 WhatsApp +91 82914 55297
              </a>
              <a
                href="tel:+918291455297"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-full text-sm transition-colors"
              >
                📞 Call Vinod Now
              </a>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-6 py-3 rounded-full text-sm transition-colors"
              >
                🛍 Browse Products Online
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-[1000px] mx-auto px-4 py-12 space-y-10">

          {/* ── Trust Badges ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { emoji: "🏆", title: "Est. 2001", desc: "24+ years trusted in Mumbai" },
              { emoji: "✅", title: "100% Original", desc: "Direct from brand distributors" },
              { emoji: "⚡", title: "Same Day", desc: "Delivery within Mumbai" },
              { emoji: "💄", title: "500+ Brands", desc: "Widest selection in Dahisar" },
            ].map((c) => (
              <div key={c.title} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                <span className="text-3xl block mb-2">{c.emoji}</span>
                <p className="font-bold text-gray-900 text-sm">{c.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
              </div>
            ))}
          </div>

          {/* ── Store Info ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              📍 Nearest Cosmetic Shop — Shree Ambika Beauty Shop, Dahisar East Mumbai
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[
                  { icon: "🏪", label: "Shop Name", value: "Shree Ambika Beauty Shop (Shree Ambika Choice Center)" },
                  { icon: "📍", label: "Address", value: "Shop No. 8, Ashapura Shopping Centre, C S Complex, Road No. 2, Near Shanji Hotel, Anand Nagar, Dahisar East, Mumbai 400068" },
                  { icon: "🚇", label: "Nearest Metro", value: "Anand Nagar Metro Station (Western Line) — exit and walk 2 minutes" },
                  { icon: "🕐", label: "Store Hours", value: "Mon–Sun: 9:00 AM – 10:00 PM · Open 365 days (Holi & Election Day only exceptions)" },
                  { icon: "📱", label: "WhatsApp / Call", value: "+91 82914 55297 (Vinod)" },
                  { icon: "🌐", label: "Online Store", value: "shreeambikabeauty.com" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">{item.label}</p>
                      <p className="text-sm text-gray-800 font-medium mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <a
                    href="https://wa.me/918291455297?text=Hi Vinod! I want to order beauty products."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-sm transition-colors"
                  >
                    💬 WhatsApp Order
                  </a>
                  <a
                    href="tel:+918291455297"
                    className="flex-1 flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold py-3 rounded-xl text-sm transition-colors"
                  >
                    📞 Call Now
                  </a>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15066.410426256421!2d72.86336324787312!3d19.25614340916139!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b121454acea9%3A0xf9c45ee22136497e!2sShree%20Ambika%20Beauty%20Shop!5e0!3m2!1sen!2sin!4v1785062101260!5m2!1sen!2sin"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Shree Ambika Beauty Shop — Cosmetic Shop Near Me Mumbai"
                />
              </div>
            </div>
          </div>

          {/* ── What We Stock ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              What Does This Cosmetic Shop in Mumbai Stock?
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Shree Ambika Beauty Shop is a one-stop cosmetics store in Mumbai with 500+ brands across all
              categories — all 100% original at the best prices.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {productCategories.map((cat) => (
                <div key={cat.name} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <span className="text-2xl flex-shrink-0">{cat.emoji}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{cat.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{cat.brands}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 text-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold px-8 py-3 rounded-full text-sm transition-colors"
              >
                🛍 Browse All Products →
              </Link>
            </div>
          </div>

          {/* ── Delivery Coverage ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Beauty Shop Delivering Near You in Mumbai
            </h2>
            <p className="text-gray-500 text-sm mb-5">
              Can&apos;t come to the store? No problem — we deliver to your doorstep across Mumbai.
              Order before 12 PM for same-day delivery. WhatsApp Vinod: +918291455297
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {nearbyAreas.map((area) => (
                <div key={area.area} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="font-bold text-gray-800 text-sm">{area.area}</p>
                  <p className="text-xs text-green-600 font-semibold">{area.time}</p>
                  <p className="text-[10px] text-gray-400">{area.tag}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Why Choose Us ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
              Why Shree Ambika is Mumbai&apos;s Best Cosmetic Shop Near You
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  emoji: "✅",
                  title: "100% Original Products",
                  desc: "Every product sourced directly from authorized distributors. No fakes, ever.",
                },
                {
                  emoji: "🏆",
                  title: "24+ Years of Trust",
                  desc: "Since 2001, thousands of Mumbai families have trusted Shree Ambika for genuine beauty products.",
                },
                {
                  emoji: "💄",
                  title: "500+ Premium Brands",
                  desc: "The widest selection of beauty brands in Dahisar — cosmetics, makeup, skincare, haircare & more.",
                },
                {
                  emoji: "⚡",
                  title: "Same-Day Delivery",
                  desc: "Order before 12 PM and get your products delivered the same evening anywhere in Mumbai.",
                },
                {
                  emoji: "📦",
                  title: "Cash on Delivery",
                  desc: "Pay cash when your order arrives. Also accept UPI, GPay, PhonePe, cards and net banking.",
                },
                {
                  emoji: "💬",
                  title: "Personal WhatsApp Support",
                  desc: "Chat directly with Vinod for product recommendations, price checks & order tracking.",
                },
              ].map((card) => (
                <div key={card.title} className="flex items-start gap-3 bg-brand-light rounded-xl p-4 border border-pink-100">
                  <span className="text-2xl flex-shrink-0">{card.emoji}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{card.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── FAQ ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Frequently Asked Questions</h2>
            <div className="space-y-5">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">{faq.q}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="bg-brand-primary rounded-3xl p-8 text-center text-white">
            <h2 className="font-bold text-2xl mb-2">Visit or Order Online Today</h2>
            <p className="text-white/80 text-sm mb-2 max-w-md mx-auto">
              Shree Ambika Beauty Shop · Shop No. 8, Near Anand Nagar Metro, Dahisar East, Mumbai 400068
            </p>
            <p className="text-white/70 text-xs mb-6">Open 9 AM – 10 PM · 7 days a week · 365 days a year</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/918291455297?text=Hi Vinod! I found your cosmetic shop online. I want to order beauty products."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-full transition-colors"
              >
                💬 WhatsApp to Order
              </a>
              <a
                href="tel:+918291455297"
                className="inline-flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-3.5 rounded-full transition-colors"
              >
                📞 Call +91 82914 55297
              </a>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-primary font-bold px-8 py-3.5 rounded-full hover:bg-brand-light transition-colors"
              >
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
