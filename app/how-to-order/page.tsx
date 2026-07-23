import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "How to Order | Shree Ambika Beauty Shop",
  description:
    "Learn how to order beauty products from Shree Ambika Beauty Shop — browse online, WhatsApp Vinod at +918291455297, confirm your order, pay & get delivery. Mumbai same day, Pan India 4–7 days.",
  alternates: { canonical: "https://www.shreeambikabeauty.com/how-to-order" },
  openGraph: {
    title: "How to Order | Shree Ambika Beauty Shop",
    description:
      "Step-by-step ordering guide for Shree Ambika Beauty Shop. WhatsApp Vinod to place your order — same day delivery in Mumbai.",
    url: "https://www.shreeambikabeauty.com/how-to-order",
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

const steps = [
  {
    number: "01",
    emoji: "🛍",
    title: "Browse Products",
    desc: "Visit our website at shreeambikabeauty.com and explore our collection of 500+ brand products — skincare, makeup, haircare, perfumes and more.",
    tip: "Use the search bar or filter by category to find what you need.",
  },
  {
    number: "02",
    emoji: "📝",
    title: "Note the Product",
    desc: "Add items to your wishlist or simply note down the product name, brand, and variant you want to order.",
    tip: "You can also screenshot or share the product page link.",
  },
  {
    number: "03",
    emoji: "💬",
    title: "WhatsApp Vinod",
    desc: "Send a WhatsApp message to Vinod at +918291455297 with the product name and your delivery address.",
    tip: "You can send multiple product names in one message.",
  },
  {
    number: "04",
    emoji: "✅",
    title: "Confirm Your Order",
    desc: "Vinod will confirm the price, availability, and delivery timeline. For any out-of-stock items, he'll suggest alternatives.",
    tip: "Feel free to ask for product recommendations too!",
  },
  {
    number: "05",
    emoji: "💳",
    title: "Make Payment",
    desc: "Pay easily via UPI (GPay, PhonePe, Paytm), Credit/Debit Card, or Cash on Delivery. Vinod will share a payment QR or link.",
    tip: "COD available for orders within Mumbai.",
  },
  {
    number: "06",
    emoji: "📦",
    title: "Receive Your Order",
    desc: "Mumbai orders are delivered the same day (order before 2 PM). Pan India takes 4–7 working days. Track via WhatsApp.",
    tip: "International delivery available in 10–15 days.",
  },
];

const paymentMethods = [
  { icon: "📱", name: "GPay" },
  { icon: "📱", name: "PhonePe" },
  { icon: "📱", name: "Paytm" },
  { icon: "💳", name: "Credit Card" },
  { icon: "💳", name: "Debit Card" },
  { icon: "💵", name: "Cash" },
  { icon: "🏠", name: "COD" },
  { icon: "🏦", name: "Net Banking" },
];

export default function HowToOrderPage() {
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
              <span>How to Order</span>
            </nav>
            <h1 className="text-4xl font-heading italic text-white mb-3">How to Order</h1>
            <p className="text-white/80 text-base max-w-lg">
              Ordering from Shree Ambika Beauty Shop is simple. Follow these 6 easy steps to get your favourite beauty products delivered.
            </p>
          </div>
        </div>

        {/* Steps */}
        <section className="max-w-[900px] mx-auto px-4 py-14">
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div
                key={step.number}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Step Number */}
                  <div className="bg-brand-primary text-white flex items-center justify-center sm:w-28 py-6 sm:py-0">
                    <div className="text-center">
                      <p className="text-xs font-bold opacity-70 uppercase tracking-widest">Step</p>
                      <p className="text-4xl font-black">{step.number}</p>
                    </div>
                  </div>
                  {/* Step Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start gap-4">
                      <span className="text-4xl flex-shrink-0">{step.emoji}</span>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">{step.desc}</p>
                        <div className="flex items-start gap-2 bg-brand-light rounded-xl px-4 py-3">
                          <span className="text-brand-primary font-bold text-sm flex-shrink-0">💡</span>
                          <p className="text-sm text-gray-600">{step.tip}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Connector */}
                {i < steps.length - 1 && (
                  <div className="flex justify-center py-3 bg-gray-50 border-t border-gray-100">
                    <span className="text-gray-300 text-2xl">↓</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Big WhatsApp CTA */}
          <div className="mt-12 bg-brand-primary rounded-3xl p-8 text-center text-white">
            <p className="text-4xl mb-3">💬</p>
            <h2 className="font-bold text-2xl mb-2">Ready to Order?</h2>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
              WhatsApp Vinod right now with your product list. He&apos;ll help you pick the best products and get them delivered fast.
            </p>
            <a
              href="https://wa.me/918291455297?text=Hi Vinod! I want to place an order. Here are the products I need:"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full text-base transition-all"
            >
              💬 WhatsApp Vinod — +91 82914 55297
            </a>
            <p className="text-white/60 text-xs mt-4">
              Typically responds within minutes during business hours (9 AM – 9 PM)
            </p>
          </div>

          {/* Alternative — Order Online */}
          <div className="mt-8 bg-white rounded-3xl border border-gray-200 p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg mb-2">
                  🛒 Prefer to Order on the Website?
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  You can also browse and add products directly on our website. Once you&apos;ve made your selection, message Vinod on WhatsApp to confirm your order, pricing, and delivery. It&apos;s a seamless experience either way.
                </p>
              </div>
              <Link
                href="/products"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all"
              >
                Browse Products →
              </Link>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-8">
            <h3 className="font-bold text-gray-900 text-lg mb-4 text-center">Accepted Payment Methods</h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {paymentMethods.map((p) => (
                <div
                  key={p.name}
                  className="bg-white border border-gray-200 rounded-2xl p-3 text-center flex flex-col items-center gap-1"
                >
                  <span className="text-2xl">{p.icon}</span>
                  <span className="text-[10px] font-semibold text-gray-600">{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Summary */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { emoji: "⚡", title: "Mumbai", desc: "Same Day Delivery", sub: "Order before 2:00 PM" },
              { emoji: "🚚", title: "Pan India", desc: "4–7 Working Days", sub: "Via DTDC / Blue Dart" },
              { emoji: "✈️", title: "International", desc: "10–15 Days", sub: "Worldwide Shipping" },
            ].map((d) => (
              <div
                key={d.title}
                className="bg-white border border-gray-100 rounded-2xl p-5 text-center shadow-sm"
              >
                <span className="text-4xl block mb-2">{d.emoji}</span>
                <p className="font-bold text-gray-900">{d.title}</p>
                <p className="text-brand-primary font-semibold text-sm">{d.desc}</p>
                <p className="text-xs text-gray-400 mt-1">{d.sub}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
