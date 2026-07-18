import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import { FaStar } from "react-icons/fa";
import { FiShoppingCart } from "react-icons/fi";

export const metadata: Metadata = {
  title: "All Beauty Products | Shree Ambika Beauty Shop Mumbai",
  description: "Browse 500+ original beauty products — cosmetics, makeup, skincare, haircare from top brands. Best prices in Mumbai. Pan India delivery. WhatsApp: +918291455297",
  alternates: { canonical: "https://shreeambikabeautyshop.vercel.app/products" },
};

async function getProducts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("products")
    .select("id,name,slug,brand,category,price,mrp,discount,images,rating,reviews_count,in_stock,featured,trending")
    .eq("in_stock", true)
    .order("created_at", { ascending: false });
  return data || [];
}

interface Product {
  id: string; name: string; slug: string; brand: string; category: string;
  price: number; mrp: number; discount: number; images: string[];
  rating: number; reviews_count: number; in_stock: boolean; featured: boolean; trending: boolean;
}

function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/products/${p.slug || p.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-brand-light overflow-hidden">
        {p.images?.[0] ? (
          <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">💄</div>
        )}
        {p.trending && (
          <span className="absolute top-2 left-2 bg-brand-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">🔥 Trending</span>
        )}
        {p.featured && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">⭐ Featured</span>
        )}
        {p.discount > 0 && (
          <span className="absolute bottom-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{p.discount}% OFF</span>
        )}
      </div>
      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wide mb-1">{p.brand}</p>
        <h3 className="text-sm font-semibold text-gray-800 leading-tight mb-2 line-clamp-2 flex-1">{p.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          <FaStar size={11} className="text-yellow-400" />
          <span className="text-xs text-gray-500">{p.rating || "4.2"} ({p.reviews_count || 0})</span>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-gray-900">₹{p.price}</span>
          {p.mrp > p.price && <span className="text-xs text-gray-400 line-through">₹{p.mrp}</span>}
        </div>
        <button className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
          <FiShoppingCart size={13} /> Add to Cart
        </button>
      </div>
    </Link>
  );
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-brand-primary text-white py-10 px-4">
          <div className="max-w-[1400px] mx-auto">
            <h1 className="text-3xl font-bold font-serif mb-2">All Beauty Products</h1>
            <p className="text-white/80 text-sm">
              {products.length}+ beauty products • Mumbai store • Pan India delivery
            </p>
            <nav className="text-xs text-white/60 mt-2">
              <Link href="/" className="hover:text-white">Home</Link>
              <span className="mx-2">›</span>
              <span>Products</span>
            </nav>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 py-8">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">💄</p>
              <h2 className="text-xl font-bold text-gray-600 mb-2">Products Coming Soon!</h2>
              <p className="text-gray-400 text-sm mb-6">We&apos;re adding our collection. Meanwhile, WhatsApp us to order.</p>
              <a href="https://wa.me/918291455297" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white font-bold px-8 py-3 rounded-full hover:bg-green-600 transition-colors">
                WhatsApp +918291455297
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((p) => <ProductCard key={p.id} p={p as Product} />)}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
