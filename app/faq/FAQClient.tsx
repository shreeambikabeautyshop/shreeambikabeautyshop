"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

const faqs = [
  {
    q: "Are all products 100% original?",
    a: "Yes, absolutely. Every product at Shree Ambika Beauty Shop is 100% original and sourced directly from authorized distributors and brand partners. We have maintained this standard since 2001. We never stock fake or duplicate products — our 24+ year reputation depends on it.",
  },
  {
    q: "How do I place an order?",
    a: "You can order in two ways: (1) Browse products on our website at shreeambikabeauty.com, note the product name, then WhatsApp Vinod at +918291455297 with your order. (2) Place your order directly through our website. Either way, Vinod will confirm availability, price, and delivery details personally.",
  },
  {
    q: "Do you deliver outside Mumbai?",
    a: "Yes! We deliver Pan India in 4–7 working days via trusted couriers like DTDC, Blue Dart, and India Post. We also ship worldwide — international delivery typically takes 10–15 days. WhatsApp us to confirm international shipping charges for your country.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Cash (at the store), UPI (GPay, PhonePe, Paytm), Credit Card, Debit Card, Net Banking, and Cash on Delivery (COD) for eligible orders. For WhatsApp orders, we share a payment link or UPI QR after confirming your order.",
  },
  {
    q: "Can I return a product?",
    a: "Yes, we have a 7-day return policy. Products must be unused, in original packaging, and accompanied by the purchase receipt or order confirmation. Simply WhatsApp Vinod at +918291455297 with your order details and a photo of the product. Refunds are processed within 3–5 business days to your original payment method.",
  },
  {
    q: "How long does delivery take?",
    a: "Mumbai deliveries are same day if you order before 2:00 PM. Thane and Navi Mumbai take 1 day. Pan India orders take 4–7 working days. International orders take 10–15 days. You can track your order by WhatsApping us your order number.",
  },
  {
    q: "Do you have a physical store?",
    a: "Yes! Visit us at Anand Nagar Metro Station, Dahisar East, Mumbai 400068. We're open Monday to Sunday, 9:00 AM to 9:00 PM, all year round. Feel free to walk in to browse products or pick up your WhatsApp order.",
  },
  {
    q: "What brands do you stock?",
    a: "We stock 500+ brands including Lakme, Maybelline, SUGAR Cosmetics, L'Oreal, Wella, Pilgrim, Mamaearth, Biotique, Plum, Nykaa, Streax, Insight Cosmetics, 6MARS, Swiss Beauty, Jovees, Dermafique, and many more. If you're looking for a specific brand, WhatsApp Vinod to check availability.",
  },
];

function AccordionItem({
  faq,
  index,
  open,
  toggle,
}: {
  faq: { q: string; a: string };
  index: number;
  open: boolean;
  toggle: () => void;
}) {
  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
        open ? "border-brand-primary shadow-sm" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="w-7 h-7 rounded-full bg-brand-primary text-white text-xs font-bold flex-shrink-0 flex items-center justify-center mt-0.5">
            {index + 1}
          </span>
          <span
            className={`font-semibold text-sm leading-snug ${
              open ? "text-brand-primary" : "text-gray-900"
            }`}
          >
            {faq.q}
          </span>
        </div>
        <span
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-200 ${
            open ? "bg-brand-primary rotate-180" : "bg-gray-200 text-gray-500"
          }`}
        >
          ↓
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <div className="ml-10">
            <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FAQClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

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
              <span>FAQ</span>
            </nav>
            <h1 className="text-4xl font-heading italic text-white mb-3">
              Frequently Asked Questions
            </h1>
            <p className="text-white/80 text-base max-w-lg">
              Everything you need to know about our products, ordering process, delivery, and more.
            </p>
          </div>
        </div>

        <div className="max-w-[800px] mx-auto px-4 py-14">
          {/* FAQ Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                faq={faq}
                index={i}
                open={openIndex === i}
                toggle={() => toggle(i)}
              />
            ))}
          </div>

          {/* Still have questions */}
          <div className="mt-12 bg-brand-primary rounded-3xl p-8 text-center text-white">
            <p className="text-3xl mb-3">💬</p>
            <h2 className="font-bold text-xl mb-2">Still have a question?</h2>
            <p className="text-white/80 text-sm mb-6 max-w-md mx-auto">
              Can&apos;t find what you&apos;re looking for? WhatsApp Vinod directly — he&apos;ll be happy to help
              you personally.
            </p>
            <a
              href="https://wa.me/918291455297?text=Hi Vinod! I have a question."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-8 py-3.5 rounded-full text-sm transition-all"
            >
              💬 WhatsApp Vinod — +91 82914 55297
            </a>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "How to Order", href: "/how-to-order", emoji: "📋" },
              { label: "Delivery Info", href: "/delivery", emoji: "🚚" },
              { label: "Returns Policy", href: "/returns", emoji: "↩️" },
              { label: "Contact Us", href: "/contact", emoji: "📞" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center gap-2 bg-white border border-gray-200 hover:border-brand-primary rounded-2xl p-4 text-center text-sm font-semibold text-gray-600 hover:text-brand-primary transition-all hover:shadow-sm"
              >
                <span className="text-2xl">{link.emoji}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
