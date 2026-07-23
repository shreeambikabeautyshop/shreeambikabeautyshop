"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export default function ContactClient() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    const msg = encodeURIComponent(
      `Hi Vinod! My name is ${form.name}.\nPhone: ${form.phone}\n\n${form.message || "I want to enquire about your products."}`
    );
    window.open(`https://wa.me/918291455297?text=${msg}`, "_blank");
    setSubmitted(true);
  };

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
              <span>Contact Us</span>
            </nav>
            <h1 className="text-4xl font-heading italic text-white mb-3">Contact Us</h1>
            <p className="text-white/80 text-base max-w-lg">
              We&apos;re here to help! Reach out via WhatsApp, visit our store, or drop us an email.
            </p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-10">

            {/* Left — Contact Info */}
            <div className="space-y-6">

              {/* WhatsApp Card — Primary */}
              <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                    💬
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">WhatsApp Vinod</p>
                    <p className="text-sm text-green-600 font-semibold">Fastest way to reach us</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  Message Vinod directly on WhatsApp for product inquiries, orders, availability checks, or any questions. Typically responds within minutes.
                </p>
                <a
                  href="https://wa.me/918291455297?text=Hi Vinod! I have a question about your products."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl text-sm transition-all"
                >
                  💬 Chat on WhatsApp — +91 82914 55297
                </a>
              </div>

              {/* Store Address */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                  <span className="text-2xl">📍</span> Store Address
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-semibold text-gray-800">Shree Ambika Beauty Shop</p>
                  <p>Anand Nagar Metro Station</p>
                  <p>Dahisar East, Mumbai</p>
                  <p>Maharashtra — 400068</p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                  <span className="text-2xl">🕐</span> Business Hours
                </h3>
                <div className="space-y-2">
                  {[
                    { day: "Monday – Friday", hours: "9:00 AM – 9:00 PM" },
                    { day: "Saturday", hours: "9:00 AM – 9:00 PM" },
                    { day: "Sunday", hours: "9:00 AM – 9:00 PM" },
                  ].map((row) => (
                    <div key={row.day} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{row.day}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{row.hours}</span>
                        <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">Open</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-4">Open 365 days a year. WhatsApp available during store hours.</p>
              </div>

              {/* Email & Social */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
                  <span className="text-2xl">🌐</span> Other Ways to Connect
                </h3>
                <div className="space-y-3 text-sm">
                  <a href="mailto:shreeambikabeautyshop@gmail.com"
                    className="flex items-center gap-3 text-gray-600 hover:text-brand-primary transition-colors">
                    <span className="text-xl">📧</span>
                    <span>shreeambikabeautyshop@gmail.com</span>
                  </a>
                  <a href="https://instagram.com/shreeambikabeautyshop"
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 hover:text-brand-primary transition-colors">
                    <span className="text-xl">📸</span>
                    <span>@shreeambikabeautyshop</span>
                  </a>
                  <a href="tel:+918291455297"
                    className="flex items-center gap-3 text-gray-600 hover:text-brand-primary transition-colors">
                    <span className="text-xl">📱</span>
                    <span>+91 82914 55297</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right — Map + Quick Form */}
            <div className="space-y-6">

              {/* Google Maps */}
              <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3766.0!2d72.85696!3d19.24198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b151cb06cbf5%3A0x7f3a5e3e3e3e3e3e!2sAnand+Nagar+Metro+Station%2C+Dahisar+East%2C+Mumbai!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Shree Ambika Beauty Shop Location Map"
                />
              </div>

              {/* Quick Contact Form */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 text-lg mb-1">Send a Quick Message</h3>
                <p className="text-sm text-gray-400 mb-5">
                  Fill in your details and we&apos;ll open WhatsApp with your message pre-filled.
                </p>

                {submitted ? (
                  <div className="text-center py-8">
                    <span className="text-5xl block mb-4">🎉</span>
                    <p className="font-bold text-gray-900 mb-2">WhatsApp opened!</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Your message has been pre-filled. Just hit send and Vinod will reply shortly.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="text-sm text-brand-primary underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your Name *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Priya Sharma"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Phone Number *</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="e.g. 9876543210"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="What products are you looking for?"
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-brand-primary transition-colors resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
                    >
                      💬 Send via WhatsApp
                    </button>
                    <p className="text-center text-xs text-gray-400">
                      Submitting opens WhatsApp with your message pre-filled.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
