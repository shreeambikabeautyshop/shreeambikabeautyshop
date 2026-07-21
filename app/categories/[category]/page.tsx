import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import { FaStar } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";

const CATEGORY_MAP: Record<string, string> = {
  "cosmetics": "Cosmetics",
  "makeup": "Makeup",
  "skin-care": "Skin Care",
  "skincare": "Skin Care",
  "hair-care": "Hair Care",
  "haircare": "Hair Care",
  "body-care": "Body Care",
  "bodycare": "Body Care",
  "perfumes": "Perfumes",
  "electronics": "Electronics",
  "purses-bags": "Purses & Bags",
  "wax-accessories": "Wax & Accessories",
};

const CATEGORY_SEO: Record<string, { title: string; desc: string }> = {
  "Cosmetics": {
    title: "Cosmetics Online Mumbai | Lipstick Foundation Kajal | Shree Ambika",
    desc: "Buy original cosmetics in Mumbai — lipstick, foundation, kajal, compact & more. 500+ brands. Best price. Pan India delivery. WhatsApp +918291455297",
  },
  "Makeup": {
    title: "Makeup Products Mumbai | Brushes Eyeshadow Foundation | Shree Ambika",
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

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
  const categoryName = CATEGORY_MAP[params.category] || params.category.replace(/-/g, " ");
  const seo = CATEGORY_SEO[categoryName];
  return {
    title: seo?.title || `${categoryName} Products Mumbai | Shree Ambika Beauty Shop`,
    description: seo?.desc || `Buy original ${categoryName} products in Mumbai at best price. Pan India delivery. WhatsApp: +918291455297`,
    alternates: { canonical: `https://www.shreeambikabeauty.com/categories/${params.category}` },
  };
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const categoryName = CATEGORY_MAP[params.category] || params.category.replace(/-/g, " ");
  const products = await getCategoryProducts(categoryName);

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
        <div className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white py-10 px-4">
          <div className="max-w-[1400px] mx-auto">
            <nav className="text-xs text-white/60 mb-3">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <Link href="/products" className="hover:text-white">Products</Link>
              <span className="mx-2">›</span>
              <span>{categoryName}</span>
            </nav>
            <h1 className="text-3xl font-bold font-serif mb-2">{categoryName} Products</h1>
            <p className="text-white/80 text-sm">
              {products.length > 0 ? `${products.length} products` : "Coming soon"} • 100% Original • Mumbai Store • Pan India Delivery
            </p>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 py-8">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🛍️</p>
              <h2 className="text-xl font-bold text-gray-600 mb-2">Products Coming Soon!</h2>
              <p className="text-gray-400 text-sm mb-6">WhatsApp us to check availability of any {categoryName} product.</p>
              <a href={`https://wa.me/918291455297?text=Hi! Do you have ${categoryName} products?`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white font-bold px-8 py-3 rounded-full">
                WhatsApp +918291455297
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((p) => (
                <Link key={p.id} href={`/products/${p.slug || p.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
                  <div className="relative aspect-square bg-brand-light overflow-hidden">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">💄</div>
                    )}
                    {(p.discount ?? 0) > 0 && (
                      <span className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{p.discount}% OFF</span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-[10px] font-bold text-brand-primary uppercase mb-1">{p.brand}</p>
                    <h3 className="text-sm font-semibold text-gray-800 leading-tight mb-2 line-clamp-2 flex-1">{p.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-gray-900">₹{p.price}</span>
                      {p.mrp > p.price && <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>}
                    </div>
                    <div className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white text-xs font-bold py-2.5 rounded-xl">
                      <FiShoppingCart size={13} /> View Product
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
