import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Order Beauty Products Online | Shree Ambika Beauty Shop Mumbai",
  description:
    "Order 100% original beauty products from Shree Ambika Beauty Shop Mumbai. WhatsApp Vinod at +918291455297 — same day delivery in Mumbai, Pan India 4–7 days. COD, UPI, Card accepted.",
  alternates: { canonical: "https://www.shreeambikabeauty.com/order" },
  openGraph: {
    title: "Order Beauty Products | Shree Ambika Beauty Shop Mumbai",
    description: "Order beauty products via WhatsApp — Mumbai same day delivery. 100% original. Free shipping above ₹999.",
    url: "https://www.shreeambikabeauty.com/order",
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

const paymentMethods = [
  { emoji: "📱", name: "UPI / GPay", desc: "Google Pay, PhonePe, Paytm" },
  { emoji: "💳", name: "Credit / Debit Card", desc: "All major cards accepted" },
  { emoji: "💵", name: "Cash on Delivery", desc: "Pay when you receive" },
  { emoji: "💬", name: "WhatsApp Pay", desc: "Pay directly via WhatsApp" },
  { emoji: "🏦", name: "Net Banking", desc: "All banks supported" },
  { emoji: "💴", name: "Cash", desc: "At our Dahisar store" },
];

const whyOrder = [
  { emoji: "✅", title: "100% Original Products", desc: "Every product sourced from authorised brand distributors. No fakes, ever." },
  { emoji: "🚀", title: "Same Day Mumbai Delivery", desc: "Order before 2pm — get it the same day in Mumbai city." },
  { emoji: "🆓", title: "Free Shipping Above ₹999", desc: "Zero delivery charges on orders above ₹999 across India." },
  { emoji: "🔄", title: "Easy Returns", desc: "Defective or wrong product? We'll sort it out. 3-day return window." },
  { emoji: "🏷️", title: "Best Prices Guaranteed", desc: "Competitive prices on all 500+ brands. No hidden charges." },
  { emoji: "👤", title: "Personal Beauty Advice", desc: "Vinod guides you to the right product for your skin type and budget." },
];

export default function OrderPage() {
  const waMessage = encodeURIComponent(
    "Hi Vinod! I want to place an order from Shree Ambika Beauty Shop.\n\n🛍 Product: \n📦 Quantity: \n📍 Delivery Address: \n\nPlease confirm availability and price."
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* Hero */}
        <div className="bg-brand-primary text-white py-12 px-4 relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 opacity-10 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
          <div className="relative max-w-[900px] mx-auto text-center">
            <nav className="text-xs text-white/60 mb-5 text-left">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>Order Now</span>
            </nav>
            <p className="text-white/70 text-sm mb-2">Mumbai&apos;s Trusted Beauty Shop Since 2001</p>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif mb-3">
              Order Beauty Products 🛍
            </h1>
            <p className="text-white/80 text-sm max-w-xl mx-auto mb-6">
              500+ original brands • Same day Mumbai delivery • Pan India 4–7 days • Free shipping above ₹999
            </p>
            <a
              href={`https://wa.me/918291455297?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full text-base transition-colors shadow-lg"
            >
              💬 Order on WhatsApp — +91 82914 55297
            </a>
            <p className="text-white/50 text-xs mt-3">Tap to open WhatsApp with a pre-filled message</p>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto px-4 py-12 space-y-10">

          {/* How to Order — 3 simple steps */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Order in 3 Simple Steps</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { n:"1", emoji:"🔍", title:"Find Your Product", desc:"Browse products on our website or tell Vinod what you need on WhatsApp. He'll help you pick the right one.", action: { label:"Browse Products", href:"/products" } },
                { n:"2", emoji:"💬", title:"WhatsApp Vinod", desc:"Send the product name, quantity, and your delivery address to Vinod at +91 82914 55297 on WhatsApp.", action: { label:"Open WhatsApp", href:`https://wa.me/918291455297?text=${waMessage}`, external: true } },
                { n:"3", emoji:"🚀", title:"Pay & Get Delivered", desc:"Confirm order, pay via UPI/Card/COD — we dispatch instantly. Mumbai same day, Pan India 4–7 days.", action: { label:"Track Order", href:"/track-order" } },
              ].map((step) => (
                <div key={step.n} className="bg-brand-light rounded-2xl p-5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center font-black text-lg mb-3">{step.n}</div>
                  <span className="text-4xl mb-2">{step.emoji}</span>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5">{step.title}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed mb-3 flex-1">{step.desc}</p>
                  {step.action.external ? (
                    <a href={step.action.href} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-bold text-brand-primary hover:underline">{step.action.label} →</a>
                  ) : (
                    <Link href={step.action.href} className="text-xs font-bold text-brand-primary hover:underline">
                      {step.action.label} →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Why Order from Us */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-5 text-center">Why Order from Shree Ambika?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {whyOrder.map((w) => (
                <div key={w.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
                  <span className="text-3xl">{w.emoji}</span>
                  <p className="font-bold text-gray-900 text-sm">{w.title}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Payment Methods</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {paymentMethods.map((p) => (
                <div key={p.name} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <span className="text-2xl flex-shrink-0">{p.emoji}</span>
                  <div>
                    <p className="font-bold text-gray-800 text-xs">{p.name}</p>
                    <p className="text-gray-400 text-[10px]">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping summary */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5">🚚 Shipping & Delivery</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon:"🏙️", zone:"Mumbai", time:"Same Day", note:"Order before 2pm • Instant dispatch" },
                { icon:"🌆", zone:"Thane / Navi Mumbai", time:"1–2 Days", note:"Next working day" },
                { icon:"🇮🇳", zone:"Pan India", time:"4–7 Days", note:"Free above ₹999 • ₹79 below" },
                { icon:"✈️", zone:"International", time:"10–15 Days", note:"Worldwide shipping" },
              ].map((d) => (
                <div key={d.zone} className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
                  <span className="text-3xl">{d.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{d.zone}</p>
                    <p className="text-brand-primary font-black">{d.time}</p>
                    <p className="text-gray-400 text-[11px]">{d.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { href:"/how-to-order", emoji:"📋", label:"How to Order" },
              { href:"/delivery", emoji:"🚚", label:"Delivery Info" },
              { href:"/returns", emoji:"↩️", label:"Returns" },
              { href:"/track-order", emoji:"📦", label:"Track Order" },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="flex flex-col items-center gap-2 bg-white border border-gray-200 hover:border-brand-primary rounded-2xl p-4 text-center text-xs font-bold text-gray-600 hover:text-brand-primary transition-all">
                <span className="text-2xl">{l.emoji}</span>{l.label}
              </Link>
            ))}
          </div>

          {/* Final CTA */}
          <div className="bg-brand-primary rounded-3xl p-8 text-center text-white">
            <p className="text-4xl mb-3">💬</p>
            <h2 className="font-bold text-2xl mb-2">Ready to Order?</h2>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
              WhatsApp Vinod now — tell him what you need, he&apos;ll guide you, confirm price, and dispatch within hours.
            </p>
            <a href={`https://wa.me/918291455297?text=${waMessage}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-full transition-colors">
              💬 Start Your Order — +91 82914 55297
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
