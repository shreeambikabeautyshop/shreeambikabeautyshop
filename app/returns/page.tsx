import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Returns & Exchange Policy | Shree Ambika Beauty Shop",
  description:
    "Shree Ambika Beauty Shop returns policy — 7-day returns on unused products in original packaging. Easy exchange for wrong items. Refund within 3–5 business days.",
  alternates: { canonical: "https://www.shreeambikabeauty.com/returns" },
  openGraph: {
    title: "Returns & Exchange Policy | Shree Ambika Beauty Shop",
    description:
      "7-day hassle-free returns and exchange policy at Shree Ambika Beauty Shop. WhatsApp Vinod at +918291455297 to initiate a return.",
    url: "https://www.shreeambikabeauty.com/returns",
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

const returnSteps = [
  {
    step: "01",
    emoji: "📸",
    title: "Take a Photo",
    desc: "Take a clear photo of the product you want to return, showing its condition and original packaging.",
  },
  {
    step: "02",
    emoji: "💬",
    title: "WhatsApp Vinod",
    desc: "Message Vinod at +918291455297 within 7 days of delivery with your order number and the product photo.",
  },
  {
    step: "03",
    emoji: "✅",
    title: "Get Approval",
    desc: "Vinod will review your return request and confirm eligibility within 24 hours.",
  },
  {
    step: "04",
    emoji: "📦",
    title: "Ship the Product",
    desc: "Pack the product securely in its original packaging and ship it back to our Dahisar store address.",
  },
  {
    step: "05",
    emoji: "💰",
    title: "Receive Refund",
    desc: "Once we receive and inspect the product, your refund will be processed within 3–5 business days to your original payment method.",
  },
];

const returnableConditions = [
  "Product is unused and in original, unopened packaging",
  "All original tags, stickers, and seals are intact",
  "Product was received damaged, defective, or broken",
  "Wrong product was delivered",
  "Return is initiated within 7 days of delivery",
  "Original receipt or order confirmation is available",
];

const nonReturnableItems = [
  "Opened or used cosmetic products (lipstick, foundation, kajal, etc.)",
  "Personal care items once packaging seal is broken (face wash, serum, etc.)",
  "Products purchased on sale or special discount",
  "Items damaged due to customer misuse or improper storage",
  "Products returned after 7 days of delivery",
  "Fragrances and perfumes once box is opened",
];

export default function ReturnsPage() {
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
              <span>Returns & Exchange</span>
            </nav>
            <h1 className="text-4xl font-heading italic text-white mb-3">Returns & Exchange Policy</h1>
            <p className="text-white/80 text-base max-w-lg">
              We want you to love every product you buy from us. If something&apos;s not right, we make returns simple.
            </p>
          </div>
        </div>

        <div className="max-w-[1000px] mx-auto px-4 py-14">

          {/* Policy Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
            {[
              {
                emoji: "📅",
                title: "7-Day Returns",
                desc: "Initiate your return within 7 days of delivery for a hassle-free experience.",
                color: "bg-blue-50 border-blue-200",
              },
              {
                emoji: "🔄",
                title: "Easy Exchange",
                desc: "Received the wrong product? We'll exchange it for the correct one at no extra cost.",
                color: "bg-purple-50 border-purple-200",
              },
              {
                emoji: "💰",
                title: "3–5 Day Refund",
                desc: "Approved refunds are processed within 3–5 business days to your original payment method.",
                color: "bg-green-50 border-green-200",
              },
            ].map((card) => (
              <div key={card.title} className={`${card.color} border-2 rounded-3xl p-6 text-center`}>
                <span className="text-4xl block mb-3">{card.emoji}</span>
                <h3 className="font-bold text-gray-900 text-base mb-2">{card.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>

          {/* Return Process */}
          <div className="mb-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Return a Product</h2>
            <div className="space-y-4">
              {returnSteps.map((s) => (
                <div key={s.step} className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-start gap-5 p-6">
                  <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-black text-base flex-shrink-0">
                    {s.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{s.emoji}</span>
                      <h3 className="font-bold text-gray-900">{s.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What Can & Cannot be Returned */}
          <div className="grid md:grid-cols-2 gap-6 mb-14">
            {/* Can be returned */}
            <div className="bg-green-50 border border-green-200 rounded-3xl p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">✅</span> Eligible for Return
              </h3>
              <ul className="space-y-3">
                {returnableConditions.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-green-500 font-bold flex-shrink-0 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cannot be returned */}
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">❌</span> Not Eligible for Return
              </h3>
              <ul className="space-y-3">
                {nonReturnableItems.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-400 font-bold flex-shrink-0 mt-0.5">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Exchange Policy */}
          <div className="bg-brand-light border border-brand-accent rounded-3xl p-7 mb-14">
            <h3 className="font-bold text-gray-900 text-xl mb-4 flex items-center gap-2">
              <span className="text-3xl">🔄</span> Exchange Policy
            </h3>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
              <p>
                <strong>Wrong product delivered?</strong> We will arrange an exchange at no cost to you. Simply WhatsApp Vinod at +918291455297 with your order number and a photo of the wrong product received.
              </p>
              <p>
                <strong>Want to exchange for a different variant or size?</strong> This is possible if the product is unused and in original packaging. Any price difference will be charged or refunded accordingly.
              </p>
              <p>
                <strong>Exchange timeline:</strong> Once we receive the returned product, the exchange item will be dispatched within 2 working days.
              </p>
            </div>
          </div>

          {/* Refund Timeline */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 mb-14">
            <h3 className="font-bold text-gray-900 text-xl mb-5 flex items-center gap-2">
              <span className="text-3xl">💰</span> Refund Timeline
            </h3>
            <div className="space-y-3">
              {[
                { method: "UPI / GPay / PhonePe", time: "Within 24–48 hours" },
                { method: "Credit / Debit Card", time: "3–5 business days" },
                { method: "Net Banking", time: "3–5 business days" },
                { method: "Cash on Delivery (COD)", time: "Bank transfer within 5–7 days" },
              ].map((row) => (
                <div key={row.method} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700 font-medium">{row.method}</span>
                  <span className="text-sm font-bold text-brand-primary bg-brand-light px-3 py-1 rounded-full">
                    {row.time}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">
              * Refund timelines depend on your bank and payment provider processing times.
            </p>
          </div>

          {/* Initiate Return CTA */}
          <div className="bg-brand-primary rounded-3xl p-8 text-center text-white">
            <p className="text-4xl mb-3">📦</p>
            <h2 className="font-bold text-2xl mb-2">Need to Return Something?</h2>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
              WhatsApp Vinod with your order number and product photo to initiate a return or exchange. We&apos;ll take care of the rest.
            </p>
            <a
              href="https://wa.me/918291455297?text=Hi Vinod! I want to return a product. My order number is:"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-4 rounded-full text-base transition-all"
            >
              💬 WhatsApp to Return — +91 82914 55297
            </a>
          </div>

        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
