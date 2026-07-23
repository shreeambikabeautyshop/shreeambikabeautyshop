import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "About Us | Shree Ambika Beauty Shop Mumbai Since 2001",
  description:
    "Learn about Shree Ambika Beauty Shop — Mumbai's most trusted beauty store since 2001. Located in Dahisar East, we stock 500+ brands and deliver Pan India. 100% original products guaranteed.",
  alternates: { canonical: "https://www.shreeambikabeauty.com/about" },
  openGraph: {
    title: "About Us | Shree Ambika Beauty Shop Mumbai Since 2001",
    description:
      "Mumbai's trusted beauty shop since 2001 — 500+ brands, 100% original products, same-day delivery in Mumbai. Meet Vinod at Dahisar East.",
    url: "https://www.shreeambikabeauty.com/about",
    siteName: "Shree Ambika Beauty Shop",
    images: [
      {
        url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png",
        width: 1200,
        height: 630,
        alt: "Shree Ambika Beauty Shop Mumbai — About Us",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

const stats = [
  { value: "24+", label: "Years of Trust", emoji: "🏆" },
  { value: "500+", label: "Brands Stocked", emoji: "💄" },
  { value: "100%", label: "Original Products", emoji: "✅" },
  { value: "Pan India", label: "Delivery Available", emoji: "🚚" },
];

const reasons = [
  {
    emoji: "🏆",
    title: "24+ Years of Trust",
    desc: "Since 2001, thousands of Mumbai customers have relied on us for authentic beauty products. Our reputation is built on honesty and quality.",
  },
  {
    emoji: "✅",
    title: "100% Original Products",
    desc: "Every product we stock is sourced directly from authorized distributors and brands. No fakes, no duplicates — ever.",
  },
  {
    emoji: "💄",
    title: "500+ Premium Brands",
    desc: "From Lakme to SUGAR, Maybelline to Wella, Pilgrim to L'Oreal — we carry the widest range of beauty brands in Dahisar.",
  },
  {
    emoji: "⚡",
    title: "Same Day Delivery Mumbai",
    desc: "Order before 2 PM and get your products delivered the same day anywhere in Mumbai. Speed without compromising quality.",
  },
  {
    emoji: "🌍",
    title: "Pan India & Worldwide Shipping",
    desc: "We deliver across India in 4–7 working days. International shipping available too. WhatsApp Vinod to place your order.",
  },
  {
    emoji: "💬",
    title: "Personal WhatsApp Support",
    desc: "Speak directly with Vinod on WhatsApp for personalized product recommendations, availability checks, and order tracking.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-brand-primary text-white py-14 px-4">
          <div className="max-w-[1200px] mx-auto">
            <nav className="text-xs text-white/60 mb-4">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>About Us</span>
            </nav>
            <p className="font-script text-brand-accent text-xl mb-2">Mumbai&apos;s Trusted Beauty Store</p>
            <h1 className="text-4xl md:text-5xl font-heading italic text-white mb-4">About Shree Ambika Beauty Shop</h1>
            <p className="text-white/80 text-base max-w-xl leading-relaxed">
              Serving the people of Mumbai with 100% original beauty products since 2001. A legacy of trust, built one happy customer at a time.
            </p>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="bg-white border-b border-gray-100 py-8">
          <div className="max-w-[1200px] mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <span className="text-3xl">{s.emoji}</span>
                  <span className="text-2xl font-black text-brand-primary">{s.value}</span>
                  <span className="text-sm text-gray-500">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Our Story */}
        <section className="max-w-[1200px] mx-auto px-4 py-14">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="label-caps text-brand-primary mb-3">Our Story</p>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-5 leading-tight">
                From a Small Shop in Dahisar to Mumbai&apos;s Most Trusted Beauty Store
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  It started in 2001 with a simple vision — give the people of Mumbai access to 100% original, high-quality beauty products at honest prices. Vinod, the founder and owner of Shree Ambika Beauty Shop, set up the store in the heart of Dahisar East, right near the Anand Nagar Metro Station.
                </p>
                <p>
                  Over the past 24 years, the shop has grown from a neighbourhood cosmetics store into one of the most recognized beauty destinations in Mumbai. We now stock 500+ brands and serve customers not just in Mumbai but across India and worldwide.
                </p>
                <p>
                  What has never changed is our core commitment: every product you buy from us is 100% genuine. No counterfeits, no shortcuts.
                </p>
              </div>
            </div>
            <div className="bg-brand-light rounded-3xl p-8 flex flex-col gap-5">
              <div className="flex items-start gap-4">
                <span className="text-4xl">📅</span>
                <div>
                  <p className="font-bold text-gray-900">Established 2001</p>
                  <p className="text-sm text-gray-500">Over two decades of serving Mumbai&apos;s beauty needs from Dahisar East.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-4xl">📍</span>
                <div>
                  <p className="font-bold text-gray-900">Dahisar East, Mumbai</p>
                  <p className="text-sm text-gray-500">Located at Anand Nagar Metro Station, easily accessible from all of Mumbai.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-4xl">👨‍💼</span>
                <div>
                  <p className="font-bold text-gray-900">Owner: Vinod</p>
                  <p className="text-sm text-gray-500">Personally available on WhatsApp for product advice and orders.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="text-4xl">🌐</span>
                <div>
                  <p className="font-bold text-gray-900">Online & Offline</p>
                  <p className="text-sm text-gray-500">Visit the store or shop online — Pan India and worldwide delivery available.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-brand-primary py-14 px-4">
          <div className="max-w-[900px] mx-auto text-center">
            <p className="label-caps text-brand-accent mb-3">Our Mission</p>
            <h2 className="text-3xl md:text-4xl font-heading italic text-white mb-6 leading-tight">
              &ldquo;Your Beauty, Our Responsibility&rdquo;
            </h2>
            <p className="text-white/80 text-base leading-relaxed max-w-2xl mx-auto">
              Our mission is simple — make 100% original beauty products accessible to every Indian. No confusion, no counterfeit concerns. Just genuine products, expert advice, and service that makes you feel valued. We believe beauty should be honest, just like us.
            </p>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="max-w-[1200px] mx-auto px-4 py-14">
          <div className="text-center mb-10">
            <p className="label-caps text-brand-primary mb-2">Why Choose Us</p>
            <h2 className="text-3xl font-serif font-bold text-gray-900">What Makes Us Different</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map((r) => (
              <div key={r.title} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                <span className="text-4xl block mb-4">{r.emoji}</span>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{r.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Meet the Owner */}
        <section className="bg-white py-14 px-4">
          <div className="max-w-[800px] mx-auto text-center">
            <p className="label-caps text-brand-primary mb-3">Meet the Owner</p>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">Vinod — The Face Behind Shree Ambika</h2>
            <div className="bg-brand-light rounded-3xl p-8 text-left flex flex-col md:flex-row gap-8 items-center">
              <div className="w-28 h-28 rounded-full bg-brand-primary flex items-center justify-center text-5xl flex-shrink-0 shadow-lg">
                👨‍💼
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Vinod</h3>
                <p className="text-brand-primary font-semibold text-sm mb-3">Founder & Owner, Shree Ambika Beauty Shop</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  Vinod has been in the beauty industry since 2001, building relationships with top brands and distributors to ensure every customer gets only authentic products. His passion for beauty and dedication to customer satisfaction has made Shree Ambika a household name in Dahisar and beyond.
                </p>
                <a
                  href="https://wa.me/918291455297?text=Hi Vinod! I visited your website and want to know more about your products."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full text-sm transition-all"
                >
                  <span>💬</span> Chat with Vinod on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Store Location */}
        <section className="max-w-[1200px] mx-auto px-4 py-14">
          <div className="text-center mb-8">
            <p className="label-caps text-brand-primary mb-2">Find Us</p>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Visit Our Store</h2>
            <p className="text-gray-500 text-sm">Anand Nagar Metro Station, Dahisar East, Mumbai 400068</p>
          </div>
          <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3766.0!2d72.85696!3d19.24198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b151cb06cbf5%3A0x7f3a5e3e3e3e3e3e!2sAnand+Nagar+Metro+Station%2C+Dahisar+East%2C+Mumbai!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Shree Ambika Beauty Shop Location — Anand Nagar Metro, Dahisar East Mumbai"
            />
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>📍</span>
              <span>Anand Nagar Metro Station, Dahisar East, Mumbai 400068</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🕐</span>
              <span>Open Mon–Sun: 9:00 AM – 9:00 PM</span>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-brand-primary py-14 px-4">
          <div className="max-w-[700px] mx-auto text-center">
            <h2 className="text-3xl font-heading italic text-white mb-4">Ready to Shop?</h2>
            <p className="text-white/80 mb-8 leading-relaxed">
              Browse our collection online or WhatsApp Vinod directly. Same-day delivery in Mumbai, Pan India in 4–7 days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/918291455297?text=Hi Vinod! I want to place an order."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full text-base transition-all"
              >
                💬 WhatsApp Vinod
              </a>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-primary font-bold px-8 py-4 rounded-full text-base hover:bg-brand-light transition-all"
              >
                🛍 Browse Products
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
