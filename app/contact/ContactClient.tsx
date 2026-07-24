"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

/* ── Quick Message Form ─────────────────────────────── */
function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    const msg = encodeURIComponent(
      `Hi Vinod! My name is ${form.name}, phone ${form.phone}. Message: ${form.message || "I want to enquire about your products."}`
    );
    window.open(`https://wa.me/918291455297?text=${msg}`, "_blank");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center py-10">
        <span className="text-6xl block mb-4" aria-hidden="true">🎉</span>
        <h3 className="font-bold text-gray-900 text-lg mb-2">WhatsApp Opened!</h3>
        <p className="text-sm text-gray-500 mb-5 leading-relaxed">
          Your message has been pre-filled. Just hit send and Vinod will reply shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-sm text-brand-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label htmlFor="contact-name" className="block text-xs font-semibold text-gray-600 mb-1.5">
          Your Name <span className="text-brand-primary">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Priya Sharma"
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-accent transition-colors"
        />
      </div>
      <div>
        <label htmlFor="contact-phone" className="block text-xs font-semibold text-gray-600 mb-1.5">
          Phone Number <span className="text-brand-primary">*</span>
        </label>
        <input
          id="contact-phone"
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="e.g. 9876543210"
          required
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-accent transition-colors"
        />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-xs font-semibold text-gray-600 mb-1.5">
          Message
        </label>
        <textarea
          id="contact-message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="What products are you looking for? Or ask any question..."
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-accent transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
      >
        💬 Send via WhatsApp
      </button>
      <p className="text-center text-xs text-gray-400">
        Submitting opens WhatsApp with your message pre-filled. No data is stored.
      </p>
    </form>
  );
}

/* ── Contact Methods ─────────────────────────────────── */
const contactMethods = [
  {
    emoji: "💬",
    title: "WhatsApp (Primary)",
    detail: "+91 82914 55297",
    subtext: "Fastest response — typically within minutes",
    href: "https://wa.me/918291455297?text=Hi Vinod! I have a question.",
    external: true,
    accent: "bg-green-50 border-green-200",
    btnClass: "bg-green-500 hover:bg-green-600 text-white",
    btnLabel: "Chat on WhatsApp",
  },
  {
    emoji: "📸",
    title: "Instagram",
    detail: "@shreeambikabeautyshop",
    subtext: "DM us for product photos & updates",
    href: "https://instagram.com/shreeambikabeautyshop",
    external: true,
    accent: "bg-pink-50 border-pink-200",
    btnClass: "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 text-white",
    btnLabel: "Open Instagram",
  },
  {
    emoji: "📧",
    title: "Email",
    detail: "shreeambikabeautyshop@gmail.com",
    subtext: "For billing, feedback & partnerships",
    href: "mailto:shreeambikabeautyshop@gmail.com",
    external: false,
    accent: "bg-blue-50 border-blue-200",
    btnClass: "bg-blue-500 hover:bg-blue-600 text-white",
    btnLabel: "Send Email",
  },
  {
    emoji: "📍",
    title: "Visit Store",
    detail: "Anand Nagar Metro, Dahisar East",
    subtext: "Open Mon–Sun: 9:00 AM – 9:00 PM",
    href: "https://maps.google.com/?q=Anand+Nagar+Metro+Station+Dahisar+East+Mumbai",
    external: true,
    accent: "bg-brand-light border-brand-accent/40",
    btnClass: "bg-brand-primary hover:bg-brand-dark text-white",
    btnLabel: "Get Directions",
  },
];

/* ── Main Component ──────────────────────────────────── */
export default function ContactClient() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ──────────────────────────────────────── */}
        <section className="bg-brand-primary text-white py-16 px-4">
          <div className="max-w-[1200px] mx-auto">
            <nav aria-label="Breadcrumb" className="text-xs text-white/60 mb-5 flex items-center gap-1">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>›</span>
              <span className="text-white/90">Contact Us</span>
            </nav>
            <p className="text-brand-accent font-semibold text-sm uppercase tracking-widest mb-3">
              We&apos;re Here to Help
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading italic text-white mb-5 leading-tight">
              Contact Us
            </h1>
            <p className="text-white/80 text-base sm:text-lg max-w-lg leading-relaxed">
              We&apos;re here to help — reach out any time. WhatsApp is the fastest way to get a response from Vinod.
            </p>
          </div>
        </section>

        <div className="max-w-[1200px] mx-auto px-4 py-12 space-y-12">

          {/* ── Primary WhatsApp Card ─────────────────────── */}
          <section aria-label="Primary contact — WhatsApp">
            <div className="bg-green-500 rounded-3xl p-8 sm:p-10 text-white text-center shadow-xl">
              <p className="text-5xl mb-4" aria-hidden="true">💬</p>
              <h2 className="text-2xl sm:text-3xl font-heading italic mb-2">Chat with Vinod on WhatsApp</h2>
              <p className="text-3xl font-black tracking-wide mt-3 mb-2">+91 82914 55297</p>
              <p className="text-white/80 text-sm mb-7">Typically replies within minutes · 9 AM – 9 PM, 7 days a week</p>
              <a
                href="https://wa.me/918291455297?text=Hi Vinod! I want to enquire about your beauty products."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-white text-green-600 font-black px-10 py-4 rounded-full text-base hover:bg-green-50 transition-all shadow-lg"
              >
                💬 Open WhatsApp Now
              </a>
            </div>
          </section>

          {/* ── All Contact Methods ───────────────────────── */}
          <section aria-labelledby="contact-methods-heading">
            <h2 id="contact-methods-heading" className="text-2xl font-heading italic text-gray-900 mb-6 text-center">
              All Ways to Reach Us
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {contactMethods.map((method) => (
                <div key={method.title} className={`rounded-2xl border-2 p-6 flex flex-col gap-3 ${method.accent}`}>
                  <span className="text-4xl" aria-hidden="true">{method.emoji}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-base">{method.title}</p>
                    <p className="text-sm text-gray-700 font-semibold mt-0.5">{method.detail}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{method.subtext}</p>
                  </div>
                  <a
                    href={method.href}
                    target={method.external ? "_blank" : undefined}
                    rel={method.external ? "noopener noreferrer" : undefined}
                    className={`mt-auto flex items-center justify-center gap-1.5 font-bold py-2.5 px-4 rounded-xl text-sm transition-all ${method.btnClass}`}
                  >
                    {method.btnLabel}
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* ── Store Info + Map ──────────────────────────── */}
          <section id="store-info" aria-labelledby="store-heading">
            <h2 id="store-heading" className="text-2xl font-heading italic text-gray-900 mb-6 text-center">
              Visit Our Store
            </h2>
            <div className="grid md:grid-cols-5 gap-6 items-start">
              {/* Map */}
              <div className="md:col-span-3 rounded-3xl overflow-hidden border border-gray-200 shadow-md">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.0!2d72.8651!3d19.2427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sAnand+Nagar+Metro+Station+Dahisar+East!5e0!3m2!1sen!2sin!4v1"
                  width="100%"
                  height="360"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Shree Ambika Beauty Shop Location — Anand Nagar Metro Station, Dahisar East Mumbai"
                />
              </div>
              {/* Store Details */}
              <address className="md:col-span-2 bg-brand-light rounded-3xl p-7 not-italic space-y-5">
                <h3 className="font-heading italic text-lg text-gray-900">Shree Ambika Beauty Shop</h3>
                {[
                  { icon: "📍", label: "Address", value: "Anand Nagar Metro Station, Dahisar East, Mumbai — 400068" },
                  { icon: "🕐", label: "Store Hours", value: "Monday – Sunday: 9:00 AM – 9:00 PM (Open 365 days)" },
                  { icon: "🚇", label: "Nearby Transit", value: "Anand Nagar Metro Station (Western Line)" },
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
                  href="https://wa.me/918291455297?text=Hi Vinod! I want directions to your store."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl text-sm transition-all"
                >
                  💬 WhatsApp for Directions
                </a>
              </address>
            </div>
          </section>

          {/* ── Quick Message Form ────────────────────────── */}
          <section aria-labelledby="form-heading">
            <div className="max-w-[620px] mx-auto">
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 id="form-heading" className="text-2xl font-heading italic text-gray-900 mb-2">
                  Send a Quick Message
                </h2>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  Fill in your details below and we&apos;ll open WhatsApp with your message pre-filled. No sign-up needed.
                </p>
                <ContactForm />
              </div>
            </div>
          </section>

          {/* ── FAQ Teaser ────────────────────────────────── */}
          <section aria-label="FAQ teaser">
            <div className="bg-brand-light rounded-3xl p-8 border border-brand-accent/30 text-center">
              <span className="text-5xl block mb-4" aria-hidden="true">❓</span>
              <h2 className="text-xl font-heading italic text-gray-900 mb-2">Have More Questions?</h2>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Find answers about ordering, delivery, returns, products, and more in our FAQ page.
              </p>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white font-bold px-8 py-3.5 rounded-full text-sm transition-all"
              >
                Browse All FAQs →
              </Link>
            </div>
          </section>

        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
