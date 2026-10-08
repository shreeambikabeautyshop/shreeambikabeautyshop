import { Suspense } from "react";
import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy Original Beauty Products Mumbai | 500+ Brands | COD | Shree Ambika Dahisar",
  description:
    "500+ original beauty products — Lakme, Maybelline, SUGAR, L'Oréal, Insight, Swiss Beauty & more. ✅ 100% genuine. ⚡ Same-day delivery Dahisar, Borivali, Kandivali, Mira Road. 📦 COD available. 💬 WhatsApp +91 82914 55297",
  alternates: { canonical: "https://www.shreeambikabeauty.com/products" },
};

async function getAllProducts() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data } = await supabase
    .from("products")
    .select("id,name,slug,brand,category,price,mrp,discount,images,rating,reviews_count,in_stock,featured,trending,tags,description")
    .eq("in_stock", true)
    .order("created_at", { ascending: false });
  return data || [];
}

export default async function ProductsPage() {
  const products = await getAllProducts();

  // ItemList schema — helps Google show product rich results in search
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Beauty Products at Shree Ambika Beauty Shop Mumbai",
    "description": "500+ original beauty products — makeup, skincare, haircare from top brands. 100% authentic. Same day delivery Mumbai.",
    "url": "https://www.shreeambikabeauty.com/products",
    "numberOfItems": products.length,
    "itemListElement": products.slice(0, 50).map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": `https://www.shreeambikabeauty.com/products/${p.slug || p.id}`,
      "name": p.name,
    })),
  };

  return (
    <>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ProductsClient products={products} />
      </Suspense>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
