import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Beauty Product Categories | Makeup, Skincare, Haircare & More | Shree Ambika Mumbai",
  description:
    "Shop by category — Makeup, Skincare, Hair Care, Cosmetics, Perfumes, Body Care & more. 500+ brands, 100% original. ⚡ Same-day delivery Mumbai. 📦 COD available. WhatsApp: +91 82914 55297",
  alternates: { canonical: "https://www.shreeambikabeauty.com/categories" },
};

const CATEGORIES = [
  { slug: "makeup",          emoji: "🎨", name: "Makeup",            desc: "Foundations, eyeliners, lipsticks, palettes & more",   color: "bg-pink-50 border-pink-200" },
  { slug: "skincare",        emoji: "✨", name: "Skin Care",          desc: "Serums, moisturizers, sunscreen, face wash & more",   color: "bg-blue-50 border-blue-200" },
  { slug: "haircare",        emoji: "💆", name: "Hair Care",          desc: "Shampoos, conditioners, serums, hair oils & more",    color: "bg-amber-50 border-amber-200" },
  { slug: "cosmetics",       emoji: "💄", name: "Cosmetics",          desc: "Lipsticks, kajal, compact, concealer & more",         color: "bg-red-50 border-red-200" },
  { slug: "bodycare",        emoji: "🧴", name: "Body Care",          desc: "Body lotions, scrubs, deodorants & more",             color: "bg-green-50 border-green-200" },
  { slug: "perfumes",        emoji: "🌸", name: "Perfumes",           desc: "Fragrances, deodorants, body mists & more",          color: "bg-purple-50 border-purple-200" },
  { slug: "electronics",     emoji: "💅", name: "Electronics",        desc: "Hair dryers, straighteners, curlers & more",         color: "bg-gray-50 border-gray-200" },
  { slug: "purses-bags",     emoji: "👜", name: "Purses & Bags",      desc: "Handbags, clutches, wallets & more",                 color: "bg-orange-50 border-orange-200" },
  { slug: "wax-accessories", emoji: "🪮", name: "Wax & Accessories",  desc: "Wax strips, hair removal, beauty tools & more",      color: "bg-teal-50 border-teal-200" },
];

export default function CategoriesPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-brand-primary text-white py-10 px-4">
          <div className="max-w-[1200px] mx-auto">
            <nav className="text-xs text-white/60 mb-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>Categories</span>
            </nav>
            <h1 className="text-3xl font-bold font-serif mb-2">Shop by Category</h1>
            <p className="text-white/80 text-sm">Browse all beauty product categories — 100% original, best prices, same day delivery in Mumbai</p>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5">
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`}
                className={`group ${cat.color} border-2 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col gap-3`}>
                <span className="text-4xl">{cat.emoji}</span>
                <div>
                  <h2 className="font-bold text-gray-900 text-base group-hover:text-brand-primary transition-colors">{cat.name}</h2>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{cat.desc}</p>
                </div>
                <span className="text-xs font-bold text-brand-primary mt-auto">Shop Now →</span>
              </Link>
            ))}
          </div>
          <div className="mt-10 bg-brand-primary rounded-2xl p-6 text-center text-white">
            <h2 className="font-bold text-lg mb-2">Can&apos;t find what you need?</h2>
            <p className="text-white/80 text-sm mb-4">WhatsApp Vinod — we stock 500+ brands and can source any beauty product</p>
            <a href="https://wa.me/918291455297?text=Hi Vinod! I am looking for a specific product."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-full text-sm transition-colors">
              💬 WhatsApp +91 82914 55297
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
