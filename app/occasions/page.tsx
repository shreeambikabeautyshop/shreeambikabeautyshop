import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";

export const metadata: Metadata = {
  title: "Shop by Occasion | Shree Ambika Beauty Shop Mumbai",
  description: "Find the perfect beauty products for every occasion — Wedding, Party, Office, Daily use, Date Night, Festival, Travel and Gifting. 100% original. Same day delivery Mumbai. WhatsApp: +918291455297",
  alternates: { canonical: "https://www.shreeambikabeauty.com/occasions" },
};

const OCCASIONS = [
  { slug: "wedding",    emoji: "💍", name: "Wedding",        desc: "Bridal & lehenga looks — foundation, kajal, lipstick",    color: "bg-pink-50 border-pink-200" },
  { slug: "party",      emoji: "🎉", name: "Party",          desc: "Bold & glam — shimmer, glitter, statement looks",         color: "bg-purple-50 border-purple-200" },
  { slug: "office",     emoji: "💼", name: "Office",         desc: "Clean & professional — subtle, polished everyday looks",  color: "bg-blue-50 border-blue-200" },
  { slug: "daily",      emoji: "☀️", name: "Daily Use",      desc: "Natural & minimal — sunscreen, tinted lip balm, kajal",   color: "bg-yellow-50 border-yellow-200" },
  { slug: "date-night", emoji: "🌹", name: "Date Night",     desc: "Romantic & sultry — perfumes, bold lips, luminous skin",  color: "bg-red-50 border-red-200" },
  { slug: "festival",   emoji: "🪔", name: "Festival",       desc: "Traditional & vibrant — ethnic makeup, kajal, colours",   color: "bg-orange-50 border-orange-200" },
  { slug: "travel",     emoji: "✈️", name: "Travel",         desc: "Light & fuss-free — travel-size essentials, SPF",        color: "bg-teal-50 border-teal-200" },
  { slug: "gifting",    emoji: "🎁", name: "Gifting",        desc: "For her & him — curated sets, skincare, perfumes",        color: "bg-green-50 border-green-200" },
];

export default function OccasionsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-brand-primary text-white py-10 px-4">
          <div className="max-w-[1200px] mx-auto">
            <nav className="text-xs text-white/60 mb-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>Shop by Occasion</span>
            </nav>
            <h1 className="text-3xl font-bold font-serif mb-2">Shop by Occasion</h1>
            <p className="text-white/80 text-sm">Find the perfect beauty products for every moment — wedding, party, office, festival & more</p>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {OCCASIONS.map(occ => (
              <Link key={occ.slug} href={`/occasions/${occ.slug}`}
                className={`group ${occ.color} border-2 rounded-2xl p-5 hover:shadow-lg transition-all hover:-translate-y-1 flex flex-col gap-3`}>
                <span className="text-4xl">{occ.emoji}</span>
                <div>
                  <h2 className="font-bold text-gray-900 text-base group-hover:text-brand-primary transition-colors">{occ.name}</h2>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{occ.desc}</p>
                </div>
                <span className="text-xs font-bold text-brand-primary mt-auto">Find Products →</span>
              </Link>
            ))}
          </div>
          <div className="mt-10 bg-brand-primary rounded-2xl p-6 text-center text-white">
            <h2 className="font-bold text-lg mb-2">Need personalised suggestions?</h2>
            <p className="text-white/80 text-sm mb-4">Tell Vinod your occasion and skin type — he will recommend the perfect products for you</p>
            <a href="https://wa.me/918291455297?text=Hi Vinod! I need product recommendations for a special occasion."
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
