import { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import { BRAND_SEO } from "./[brand]/page";

export const metadata: Metadata = {
  title: "Beauty Brands Mumbai | Lakme Maybelline L'Oreal Pilgrim Swiss Beauty | Shree Ambika",
  description: "Shop 500+ original beauty brands at Shree Ambika Beauty Shop Mumbai — Lakme, Maybelline, L'Oréal Professionnel, Insight Professional, Swiss Beauty, Pilgrim, Wella, Matrix & more. Same day delivery. WhatsApp: +918291455297",
  alternates: { canonical: "https://www.shreeambikabeauty.com/brands" },
  openGraph: {
    title: "All Beauty Brands — Shree Ambika Beauty Shop Mumbai",
    description: "500+ original brands in Mumbai — Lakme, Maybelline, L'Oréal, Insight, Swiss Beauty, Pilgrim, Wella, Matrix, Garnier & more. 100% original. Same day delivery.",
    url: "https://www.shreeambikabeauty.com/brands",
    images: [{ url: "https://res.cloudinary.com/zjlchjal/image/upload/v1784047036/slider-1_orhz8e.png", width: 1200, height: 630 }],
    siteName: "Shree Ambika Beauty Shop",
    locale: "en_IN",
    type: "website",
  },
};

export default function BrandsPage() {
  const brands = Object.entries(BRAND_SEO);

  const brandListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Beauty Brands at Shree Ambika Beauty Shop Mumbai",
    "url": "https://www.shreeambikabeauty.com/brands",
    "numberOfItems": brands.length,
    "itemListElement": brands.map(([slug, b], i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": b.display,
      "url": `https://www.shreeambikabeauty.com/brands/${slug}`,
    })),
  };

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandListSchema) }} />

      <main className="bg-gray-50 min-h-screen">
        {/* Hero */}
        <div className="bg-gradient-to-r from-brand-primary to-[#8B0000] text-white py-12 px-4">
          <div className="max-w-[1200px] mx-auto">
            <nav className="text-xs text-white/60 mb-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>All Brands</span>
            </nav>
            <h1 className="text-3xl font-bold font-serif mb-2">Shop by Brand</h1>
            <p className="text-white/80 text-sm max-w-xl">
              500+ premium beauty brands — 100% original, sourced from authorized distributors.
              Same-day delivery in Mumbai. Pan India 4–7 days.
            </p>
          </div>
        </div>

        <div className="max-w-[1200px] mx-auto px-4 py-10">
          {/* Brand grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {brands.map(([slug, b]) => (
              <Link key={slug} href={`/brands/${slug}`}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-primary/30 transition-all p-5 flex flex-col items-center text-center gap-2">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${b.gradient} flex items-center justify-center text-3xl shadow-sm`}>
                  {b.emoji}
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm leading-tight group-hover:text-brand-primary transition-colors">{b.display}</p>
                </div>
                <span className="text-[10px] font-semibold text-brand-primary bg-brand-light px-2.5 py-0.5 rounded-full border border-brand-primary/20">
                  View Products →
                </span>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 bg-brand-primary rounded-2xl p-6 text-white text-center">
            <h2 className="font-bold text-lg mb-1">Don&apos;t see your brand?</h2>
            <p className="text-white/80 text-sm mb-4">We stock 500+ brands. WhatsApp Vinod to check availability of any brand.</p>
            <a href="https://wa.me/918291455297?text=Hi Vinod! I am looking for a specific brand. Do you have it?"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors">
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
