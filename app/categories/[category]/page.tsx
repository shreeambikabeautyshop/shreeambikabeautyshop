import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import ProductGrid from "@/app/components/ProductGrid";

export const dynamic = "force-dynamic";

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
    title: "Cosmetics Store Mumbai | Buy Lipstick Foundation Kajal Online | Shree Ambika",
    desc: "Buy 100% original cosmetics in Mumbai — lipstick, foundation, kajal, compact, blush & more. Lakme, Maybelline, SUGAR. Best price. Same day delivery. WhatsApp +918291455297",
  },
  "Makeup": {
    title: "Makeup Products Mumbai | Brushes Eyeshadow Palette Foundation | Shree Ambika",
    desc: "Complete makeup collection at Shree Ambika Beauty Shop Dahisar Mumbai. Brushes, palettes, primers, kits. 100% original brands. WhatsApp Vinod: +918291455297",
  },
  "Skin Care": {
    title: "Skincare Products Mumbai | Serum Moisturizer Sunscreen Face Wash | Shree Ambika",
    desc: "Original skincare in Mumbai — Vitamin C serum, moisturizer, sunscreen SPF, face wash. Minimalist, Pilgrim, Neutrogena. 100% genuine. WhatsApp: +918291455297",
  },
  "Hair Care": {
    title: "Hair Care Products Mumbai | Shampoo Conditioner Hair Oil Serum | Shree Ambika",
    desc: "Best hair care in Mumbai — shampoo, conditioner, hair serum, hair oil, hair mask. L'Oreal, Wella, Schwarzkopf, Pilgrim. Original. WhatsApp: +918291455297",
  },
  "Body Care": {
    title: "Body Care Products Mumbai | Lotion Body Wash Scrub Deodorant | Shree Ambika",
    desc: "Buy original body care in Mumbai — body lotion, body wash, scrub, deodorant, talcum powder. Best brands at best prices. WhatsApp: +918291455297",
  },
  "Perfumes": {
    title: "Perfumes & Fragrances Mumbai | Original Perfume Shop Dahisar | Shree Ambika",
    desc: "100% original perfumes & fragrances in Mumbai — long lasting, international brands, best price. Fogg, Denver, Engage, Park Avenue. Same day delivery. WhatsApp: +918291455297",
  },
  "Electronics": {
    title: "Beauty Electronics Mumbai | Hair Dryer Straightener Curler Trimmer | Shree Ambika",
    desc: "Buy original beauty electronics in Mumbai — hair dryers, straighteners, curlers, beard trimmers. Philips, Havells, Vega. Best prices. WhatsApp: +918291455297",
  },
  "Purses & Bags": {
    title: "Ladies Purses & Bags Mumbai | Handbags Wallets Clutch | Shree Ambika",
    desc: "Stylish ladies purses, handbags, clutches and wallets at Shree Ambika Beauty Shop Mumbai. Best quality, best prices. Pan India delivery. +918291455297",
  },
  "Wax & Accessories": {
    title: "Wax Strips & Hair Removal Products Mumbai | Beauty Accessories | Shree Ambika",
    desc: "Buy wax strips, hair removal cream, threading, epilators & beauty accessories in Mumbai. Anne French, Veet, Rica. Original, best price. WhatsApp: +918291455297",
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
  const products = await getCategoryProducts(categoryName);

  return {
    title: seo?.title || `${categoryName} Products Mumbai | Shree Ambika Beauty Shop`,
    description: seo?.desc || `Buy original ${categoryName} products in Mumbai at best price. Pan India delivery. WhatsApp: +918291455297`,
    alternates: { canonical: `https://www.shreeambikabeauty.com/categories/${params.category}` },
    // noindex empty categories — prevents "thin content duplicate" penalty in Search Console
    robots: products.length === 0 ? { index: false, follow: false } : { index: true, follow: true },
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
          <ProductGrid
            products={products}
            source="category_page"
            emptyTitle="Products Coming Soon!"
            emptyMessage={`WhatsApp us to check availability of any ${categoryName} product.`}
            emptyWhatsAppMsg={`Hi Vinod! Do you have ${categoryName} products? Please suggest.`}
          />
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
