import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import CategoryProductsClient from "./CategoryProductsClient";

const CATEGORY_MAP: Record<string, string> = {
  "cosmetics":        "Cosmetics",
  "makeup":           "Makeup",
  "skin-care":        "Skin Care",
  "skincare":         "Skin Care",
  "hair-care":        "Hair Care",
  "haircare":         "Hair Care",
  "body-care":        "Body Care",
  "bodycare":         "Body Care",
  "perfumes":         "Perfumes",
  "electronics":      "Electronics",
  "purses-bags":      "Purses & Bags",
  "wax-accessories":  "Wax & Accessories",
};

// Hero gradient per category
const CATEGORY_GRADIENT: Record<string, string> = {
  "Cosmetics":        "from-[#C41E3A] to-[#8B0000]",
  "Makeup":           "from-[#a855f7] to-[#C41E3A]",
  "Skin Care":        "from-[#0ea5e9] to-[#6366f1]",
  "Hair Care":        "from-[#f59e0b] to-[#ef4444]",
  "Body Care":        "from-[#10b981] to-[#0ea5e9]",
  "Perfumes":         "from-[#8b5cf6] to-[#ec4899]",
  "Electronics":      "from-[#334155] to-[#1e3a5f]",
  "Purses & Bags":    "from-[#92400e] to-[#78350f]",
  "Wax & Accessories":"from-[#475569] to-[#1e293b]",
};

const CATEGORY_SEO: Record<string, { title: string; desc: string }> = {
  "Cosmetics": {
    title: "Cosmetics Online Mumbai | Lipstick Foundation Kajal | Shree Ambika",
    desc: "Buy original cosmetics in Mumbai — lipstick, foundation, kajal, compact & more. 500+ brands. Best price. Pan India delivery. WhatsApp +918291455297",
  },
  "Makeup": {
    title: "Makeup Products Mumbai | Brushes Eyeshadow Palette | Shree Ambika",
    desc: "Complete makeup collection at Shree Ambika Beauty Shop Mumbai. Brushes, palettes, kits from top brands. WhatsApp Vinod: +918291455297",
  },
  "Skin Care": {
    title: "Skincare Products Mumbai | Serum Moisturizer Sunscreen | Shree Ambika",
    desc: "Original skincare products in Mumbai — serums, moisturizers, sunscreen, face wash. 100% genuine. Pan India delivery. +918291455297",
  },
  "Hair Care": {
    title: "Hair Care Products Mumbai | Shampoo Conditioner Hair Oil | Shree Ambika",
    desc: "Best hair care products in Mumbai — shampoo, conditioner, serum, hair oil from top brands. Original & affordable. WhatsApp: +918291455297",
  },
  "Body Care": {
    title: "Body Care Products Mumbai | Lotion Body Wash Scrub | Shree Ambika",
    desc: "Buy original body care products in Mumbai — lotions, body wash, scrubs, deodorants. Best brands at best prices. Pan India delivery. +918291455297",
  },
  "Perfumes": {
    title: "Perfumes & Fragrances Mumbai | Original Perfume Shop | Shree Ambika",
    desc: "100% original perfumes & fragrances in Mumbai — international brands, long lasting. Best price. Same day delivery. WhatsApp: +918291455297",
  },
  "Electronics": {
    title: "Beauty Electronics Mumbai | Hair Dryer Straightener Trimmer | Shree Ambika",
    desc: "Buy original beauty electronics in Mumbai — hair dryers, straighteners, curlers, trimmers. Top brands, best prices. WhatsApp: +918291455297",
  },
  "Purses & Bags": {
    title: "Purses & Bags Mumbai | Handbags Wallets | Shree Ambika Beauty Shop",
    desc: "Stylish purses, handbags and wallets at Shree Ambika Beauty Shop Mumbai. Great quality, best prices. Pan India delivery. +918291455297",
  },
  "Wax & Accessories": {
    title: "Wax & Beauty Accessories Mumbai | Hair Removal | Shree Ambika",
    desc: "Buy wax strips, hair removal products & beauty accessories in Mumbai. Original products, best prices. WhatsApp: +918291455297",
  },
};

async function getCategoryProducts(categoryName: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("products")
    .select("id,name,slug,brand,category,price,mrp,discount,images,rating,reviews_count,in_stock")
    .eq("category", categoryName)
    .eq("in_stock", true)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map((category) => ({ category }));
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const categoryName = CATEGORY_MAP[params.category] || params.category.replace(/-/g, " ");
  const seo = CATEGORY_SEO[categoryName];
  return {
    title: seo?.title || `${categoryName} Products Mumbai | Shree Ambika Beauty Shop`,
    description: seo?.desc || `Buy original ${categoryName} products in Mumbai at best price. Pan India delivery. WhatsApp: +918291455297`,
    alternates: { canonical: `https://www.shreeambikabeauty.com/categories/${params.category}` },
    openGraph: {
      title: seo?.title || `${categoryName} — Shree Ambika Beauty Shop`,
      description: seo?.desc || `Buy original ${categoryName} in Mumbai`,
      url: `https://www.shreeambikabeauty.com/categories/${params.category}`,
    },
  };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const categoryName = CATEGORY_MAP[params.category] || params.category.replace(/-/g, " ");
  const products = await getCategoryProducts(categoryName);
  const gradient = CATEGORY_GRADIENT[categoryName] || "from-brand-primary to-[#8B0000]";

  const CATEGORY_EMOJI: Record<string, string> = {
    "Cosmetics":"💄","Makeup":"🎨","Skin Care":"✨","Hair Care":"💆",
    "Body Care":"🧴","Perfumes":"🌸","Electronics":"💅","Purses & Bags":"👜","Wax & Accessories":"🪮",
  };
  const emoji = CATEGORY_EMOJI[categoryName] || "🛍️";

  // Category JSON-LD
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${categoryName} Products — Shree Ambika Beauty Shop Mumbai`,
    "description": `100% original ${categoryName} products at best prices. Mumbai store, Pan India delivery.`,
    "url": `https://www.shreeambikabeauty.com/categories/${params.category}`,
    "numberOfItems": products.length,
    "provider": {
      "@type": "Organization",
      "name": "Shree Ambika Beauty Shop",
      "telephone": "+918291455297",
    },
  };

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />

      <main className="bg-gray-50 min-h-screen">
        <div className={`bg-gradient-to-r ${gradient} text-white py-10 px-4`}>
          <div className="max-w-[1400px] mx-auto">
            <nav className="text-xs text-white/60 mb-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <Link href="/products" className="hover:text-white">Products</Link>
              <span className="mx-2">›</span>
              <span>{categoryName}</span>
            </nav>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{emoji}</span>
              <h1 className="text-3xl font-bold font-serif">{categoryName}</h1>
            </div>
            <p className="text-white/80 text-sm">
              {products.length > 0 ? `${products.length} products` : "Coming soon"} • 100% Original • Mumbai Store • Pan India Delivery
            </p>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <CategoryProductsClient
            products={products}
            categoryName={categoryName}
            categorySlug={params.category}
          />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
