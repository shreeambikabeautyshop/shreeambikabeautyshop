import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "About Us | Shree Ambika Beauty Shop Mumbai Since 2001 | Vinod Goswami",
  description:
    "Shree Ambika Beauty Shop — Mumbai's most trusted beauty store since 2001, founded by Vinod Goswami in Dahisar East. 500+ brands, 100% original products, same-day delivery. WhatsApp +918291455297",
  alternates: { canonical: "https://www.shreeambikabeauty.com/about" },
  openGraph: {
    title: "About Us | Shree Ambika Beauty Shop Mumbai Since 2001 | Vinod Goswami",
    description:
      "Shree Ambika Beauty Shop — Mumbai's most trusted beauty store since 2001. Founded by Vinod Goswami in Dahisar East. 500+ brands, 100% original products, same-day delivery in Mumbai.",
    url: "https://www.shreeambikabeauty.com/about",
    siteName: "Shree Ambika Beauty Shop",
    images: [
      {
        url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png",
        width: 1200,
        height: 630,
        alt: "About Shree Ambika Beauty Shop — Mumbai's Trusted Beauty Store Since 2001",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
};

const stats = [
  { value: "24+", label: "Years of Trust", icon: "🏆" },
  { value: "500+", label: "Brands Stocked", icon: "💄" },
  { value: "10,000+", label: "Happy Customers", icon: "❤️" },
  { value: "100%", label: "Original Products", icon: "✅" },
];

const milestones = [
  { year: "2001", label: "Founded", desc: "Vinod Goswami opens Shree Ambika Beauty Shop in Dahisar East, Mumbai." },
  { year: "2010", label: "Expanded", desc: "Expanded product range to 200+ brands covering skincare, haircare & cosmetics." },
  { year: "2018", label: "Online Presence", desc: "Launched on social media and began taking WhatsApp orders from across India." },
  { year: "2024", label: "Website Launch", desc: "Official website shreeambikabeauty.com launched with full product catalogue." },
  { year: "2025", label: "Pan India Delivery", desc: "Now delivering to every city in India with same-day delivery in Mumbai." },
];

const whyCards = [
  {
    emoji: "✅",
    title: "100% Original Products",
    desc: "Every product is sourced directly from authorized distributors and official brand channels. Zero fakes, zero duplicates — ever.",
  },
  {
    emoji: "🏆",
    title: "24+ Years of Trust",
    desc: "Since 2001, thousands of Mumbai families have trusted us. Our reputation is built on honesty, transparency, and quality.",
  },
  {
    emoji: "💄",
    title: "500+ Premium Brands",
    desc: "From Lakme, Maybelline, and L'Oréal to SUGAR, Wella, and Pilgrim — the widest beauty brand selection in Dahisar.",
  },
  {
    emoji: "⚡",
    title: "Mumbai Same-Day Delivery",
    desc: "Order before 2 PM and receive your products the same evening anywhere in Mumbai. Speed and quality, always.",
  },
  {
    emoji: "🚚",
    title: "Pan India Delivery",
    desc: "We ship to every corner of India in 4–7 working days. International shipping available too — just WhatsApp Vinod.",
  },
  {
    emoji: "💬",
    title: "Personal WhatsApp Support",
    desc: "Chat directly with Vinod for personalized product recommendations, order updates, and availability checks.",
  },
];

const reviews = [
  {
    name: "Priya Sharma",
    location: "Borivali, Mumbai",
    rating: 5,
    text: "I've been buying from Shree Ambika for over 5 years. Every product is 100% genuine — I ordered Lakme foundation and it arrived the same day. Vinod bhai is always so helpful on WhatsApp!",
    product: "Lakme Foundation",
  },
  {
    name: "Neha Desai",
    location: "Mira Road, Mumbai",
    rating: 5,
    text: "Best beauty shop in Dahisar, hands down! Got SUGAR lipstick and Wella hair color delivered within hours. The price was also better than any mall store. Highly recommend!",
    product: "SUGAR Cosmetics & Wella",
  },
  {
    name: "Anjali Patil",
    location: "Kandivali East, Mumbai",
    rating: 5,
    text: "Ordered Pilgrim vitamin C serum and Maybelline kajal — both genuine products, nicely packed. Pan India delivery to Pune took just 3 days. Will definitely order again!",
    product: "Pilgrim & Maybelline",
  },
];

const quickLinks = [
  { href: "/contact", emoji: "📞", title: "Contact Us", desc: "WhatsApp, email or visit the store" },
  { href: "/faq", emoji: "❓", title: "FAQs", desc: "Common questions answered" },
  { href: "/blog", emoji: "📝", title: "Beauty Blog", desc: "Tips, guides & product reviews" },
  { href: "/products", emoji: "🛍️", title: "Shop Products", desc: "Browse 500+ beauty brands" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="bg-brand-primary text-white py-16 px-4">
          <div className="max-w-[1200px] mx-auto">
            <nav aria-label="Breadcrumb" className="text-xs text-white/60 mb-5 flex items-center gap-1">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <span className="text-white/90">About Us</span>
            </nav>
            <p className="text-brand-accent font-semibold text-sm uppercase tracking-widest mb-3">
              Mumbai&apos;s Most Trusted Beauty Store
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading italic text-white mb-5 leading-tight">
              About Shree Ambika Beauty Shop
            </h1>
            <p className="text-white/80 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
              Mumbai&apos;s most trusted beauty destination since 2001. Built on authenticity, trust, and a genuine love for beauty.
            </p>
            <a
              href="https://wa.me/918291455297?text=Hi Vinod! I visited your About page and want to know more."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-7 py-4 rounded-full text-sm transition-all hover:shadow-lg"
            >
              💬 Chat with Vinod on WhatsApp
            </a>
          </div>
        </section>

        {/* ── Stats Bar ────────────────────────────────────── */}
        <section aria-label="Key stats" className="bg-white border-b border-gray-100 py-10 px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-2">
                  <span className="text-4xl" aria-hidden="true">{s.icon}</span>
                  <span className="text-3xl font-black text-brand-primary leading-none">{s.value}</span>
                  <span className="text-sm text-gray-500 font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Our Story ────────────────────────────────────── */}
        <section id="legacy" className="max-w-[1200px] mx-auto px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left: narrative */}
            <div>
              <p className="text-xs font-black text-brand-primary uppercase tracking-widest mb-3">Our Story</p>
              <h2 className="text-2xl sm:text-3xl font-heading italic text-gray-900 mb-6 leading-tight">
                From a Small Shop in Dahisar to Mumbai&apos;s Most Trusted Beauty Destination
              </h2>
              <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                <p>
                  In 2001, Vinod Goswami started a small beauty shop near Anand Nagar Metro Station in Dahisar East, Mumbai. His vision was straightforward: give every Mumbai customer access to 100% genuine beauty products at honest prices — no fakes, no confusion.
                </p>
                <p>
                  At a time when duplicate cosmetics flooded the market, Shree Ambika stood apart. Every product was sourced directly from authorized distributors and verified brands. Word spread fast, and what began as a neighbourhood store became a destination for beauty shoppers across the city.
                </p>
                <p>
                  Over 24 years and 10,000+ satisfied customers later, the promise remains unchanged: authenticity above all. Today Shree Ambika stocks 500+ brands — from Lakme and Maybelline to SUGAR, Pilgrim, and Wella — and delivers to every corner of India.
                </p>
              </div>

              {/* Timeline */}
              <div className="mt-10">
                <p className="text-xs font-black text-brand-primary uppercase tracking-widest mb-5">Our Journey</p>
                <ol className="relative border-l-2 border-brand-accent space-y-6 pl-6">
                  {milestones.map((m) => (
                    <li key={m.year} className="relative">
                      <span className="absolute -left-[27px] top-0.5 w-4 h-4 rounded-full bg-brand-primary border-2 border-white shadow" />
                      <p className="text-brand-primary font-black text-sm">{m.year} — {m.label}</p>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{m.desc}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Right: shop info card */}
            <div className="bg-brand-light rounded-3xl p-8 space-y-6 sticky top-24">
              <h3 className="font-heading italic text-xl text-gray-900">Shree Ambika Choice Center</h3>
              {[
                { icon: "📅", title: "Established", detail: "2001 — 24+ Years in Business" },
                { icon: "📍", title: "Location", detail: "Anand Nagar Metro Station, Dahisar East, Mumbai 400068" },
                { icon: "👨‍💼", title: "Owner", detail: "Vinod Goswami — Available on WhatsApp" },
                { icon: "💄", title: "Brands Stocked", detail: "500+ premium Indian & international brands" },
                { icon: "🚚", title: "Delivery", detail: "Same-day Mumbai · Pan India 4–7 days · Worldwide" },
                { icon: "🕐", title: "Store Hours", detail: "Monday – Sunday: 9:00 AM – 9:00 PM" },
                { icon: "🌐", title: "Website", detail: "shreeambikabeauty.com" },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0" aria-hidden="true">{item.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{item.detail}</p>
                  </div>
                </div>
              ))}
              <a
                href="https://wa.me/918291455297?text=Hi Vinod! I want to place an order."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl text-sm transition-all"
              >
                💬 Order on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ── Why Choose Us ────────────────────────────────── */}
        <section className="bg-white py-16 px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-black text-brand-primary uppercase tracking-widest mb-2">Why Choose Us</p>
              <h2 className="text-2xl sm:text-3xl font-heading italic text-gray-900">What Makes Shree Ambika Different</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {whyCards.map((card) => (
                <div
                  key={card.title}
                  className="bg-brand-light rounded-2xl p-6 border border-brand-accent/30 hover:shadow-lg transition-all hover:-translate-y-1 group"
                >
                  <span className="text-4xl block mb-4" aria-hidden="true">{card.emoji}</span>
                  <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-brand-primary transition-colors">{card.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Meet the Owner ───────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <p className="text-xs font-black text-brand-primary uppercase tracking-widest mb-2">Meet the Owner</p>
            <h2 className="text-2xl sm:text-3xl font-heading italic text-gray-900">The Face Behind Shree Ambika</h2>
          </div>
          <div className="max-w-[760px] mx-auto bg-brand-light rounded-3xl p-8">
            <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-28 h-28 rounded-full bg-brand-primary flex items-center justify-center shadow-lg">
                  <span className="text-5xl font-black text-white leading-none">V</span>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">Since 2001</p>
              </div>
              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-2xl font-heading italic text-gray-900">Vinod Goswami</h3>
                <p className="text-brand-primary font-bold text-sm mt-1 mb-4">Founder & Owner, Shree Ambika Beauty Shop</p>
                <blockquote className="border-l-4 border-brand-primary pl-4 text-gray-600 italic text-sm leading-relaxed mb-5">
                  &ldquo;We treat every customer like family. Your beauty goals are our responsibility. In 24 years, that philosophy has never changed.&rdquo;
                </blockquote>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start mb-6">
                  <span className="bg-white text-brand-primary text-xs font-bold px-3 py-1.5 rounded-full border border-brand-accent/40">
                    🏆 24+ Years Experience
                  </span>
                  <span className="bg-white text-brand-primary text-xs font-bold px-3 py-1.5 rounded-full border border-brand-accent/40">
                    🗣️ Hindi · English · Marathi
                  </span>
                  <span className="bg-white text-brand-primary text-xs font-bold px-3 py-1.5 rounded-full border border-brand-accent/40">
                    💄 500+ Brands Expert
                  </span>
                </div>
                <a
                  href="https://wa.me/918291455297?text=Hi Vinod! I saw your About page and want to enquire about products."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all"
                >
                  💬 Chat with Vinod
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Customer Reviews ─────────────────────────────── */}
        <section id="reviews" className="bg-white py-16 px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-black text-brand-primary uppercase tracking-widest mb-2">Customer Reviews</p>
              <h2 className="text-2xl sm:text-3xl font-heading italic text-gray-900 mb-3">What Our Customers Say</h2>
              <div className="inline-flex items-center gap-2 bg-brand-light px-5 py-2 rounded-full border border-brand-accent/40">
                <span className="text-yellow-500 text-lg">★★★★★</span>
                <span className="font-black text-gray-900">4.8</span>
                <span className="text-gray-400 text-sm">/ 5 · 10,000+ customers</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <article key={r.name} className="bg-brand-light rounded-2xl p-6 border border-brand-accent/30 hover:shadow-md transition-all">
                  <div className="flex items-center gap-1 text-yellow-400 text-sm mb-4" aria-label={`${r.rating} stars`}>
                    {"★".repeat(r.rating)}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">&ldquo;{r.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-black text-sm">
                      {r.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.location} · {r.product}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Visit Our Store ───────────────────────────────── */}
        <section id="store" className="max-w-[1200px] mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <p className="text-xs font-black text-brand-primary uppercase tracking-widest mb-2">Find Us</p>
            <h2 className="text-2xl sm:text-3xl font-heading italic text-gray-900 mb-2">Visit Our Store</h2>
            <p className="text-gray-500 text-sm">Anand Nagar Metro Station, Dahisar East, Mumbai 400068</p>
          </div>

          <div className="grid md:grid-cols-5 gap-6 items-start">
            {/* Map */}
            <div className="md:col-span-3 rounded-3xl overflow-hidden border border-gray-200 shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.0!2d72.8651!3d19.2427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAnand+Nagar+Metro+Station+Dahisar+East!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="380"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Shree Ambika Beauty Shop — Anand Nagar Metro Station, Dahisar East Mumbai"
              />
            </div>
            {/* Store Details */}
            <div className="md:col-span-2 bg-brand-light rounded-3xl p-7 space-y-5">
              <h3 className="font-heading italic text-lg text-gray-900">Store Details</h3>
              {[
                { icon: "📍", label: "Address", value: "Anand Nagar Metro Station, Dahisar East, Mumbai — 400068" },
                { icon: "🕐", label: "Hours", value: "Monday – Sunday: 9:00 AM – 9:00 PM (365 days)" },
                { icon: "🚇", label: "Nearby", value: "Anand Nagar Metro Station (Western Line)" },
                { icon: "📱", label: "WhatsApp", value: "+91 82914 55297" },
                { icon: "📧", label: "Email", value: "shreeambikabeautyshop@gmail.com" },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0" aria-hidden="true">{item.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-xs uppercase tracking-wide">{item.label}</p>
                    <p className="text-gray-600 text-sm mt-0.5 leading-relaxed">{item.value}</p>
                  </div>
                </div>
              ))}
              <a
                href="https://wa.me/918291455297?text=Hi Vinod! I want to visit your store. Please share directions."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl text-sm transition-all"
              >
                💬 WhatsApp for Directions
              </a>
            </div>
          </div>
        </section>

        {/* ── Quick Links ───────────────────────────────────── */}
        <section className="bg-white py-14 px-4">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-heading italic text-gray-900">Explore More</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="bg-brand-light rounded-2xl p-5 text-center border border-brand-accent/30 hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  <span className="text-4xl block mb-3" aria-hidden="true">{link.emoji}</span>
                  <p className="font-bold text-gray-900 text-sm group-hover:text-brand-primary transition-colors">{link.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{link.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────── */}
        <section className="bg-brand-primary py-14 px-4">
          <div className="max-w-[700px] mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-heading italic text-white mb-4">
              Ready to Shop 100% Original Beauty Products?
            </h2>
            <p className="text-white/80 text-sm sm:text-base mb-8 leading-relaxed">
              Browse 500+ brands online or WhatsApp Vinod directly. Same-day delivery in Mumbai, Pan India in 4–7 days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/918291455297?text=Hi Vinod! I want to place an order."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full text-sm transition-all"
              >
                💬 WhatsApp Vinod — Order Now
              </a>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-primary font-bold px-8 py-4 rounded-full text-sm hover:bg-brand-light transition-all"
              >
                🛍️ Browse All Products
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
