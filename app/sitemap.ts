import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE = "https://shreeambikabeautyshop.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: products } = await supabase
    .from("products")
    .select("slug,id,updated_at,category");

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/categories/cosmetics`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/categories/makeup`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/categories/skin-care`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/categories/hair-care`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/categories/body-care`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/categories/perfumes`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/categories/electronics`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${BASE}/products/${p.slug || p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...productPages];
}
