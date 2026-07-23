import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import WhatsAppFloat from "@/app/components/WhatsAppFloat";
import ProductsClient from "./ProductsClient";

export const metadata: Metadata = {
  title: "All Beauty Products | Shree Ambika Beauty Shop Mumbai",
  description: "Browse 500+ original beauty products — cosmetics, makeup, skincare, haircare from top brands. Smart search, voice search, image search. Best prices in Mumbai. WhatsApp: +918291455297",
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
  return (
    <>
      <Navbar />
      <ProductsClient products={products} />
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
