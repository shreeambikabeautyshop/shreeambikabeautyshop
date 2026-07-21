import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE = "https://www.shreeambikabeauty.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: products } = await supabase
    .from("products")
    .select("slug,id,updated_at,category");

  const staticPages: MetadataRoute.Sitemap = [
    // Core
    { url: BASE,                              lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE}/products`,               lastModified: new Date(), changeFrequency: "daily",   priority: 0.95 },
    // Categories
    { url: `${BASE}/categories/cosmetics`,   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/categories/makeup`,      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/categories/skincare`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/categories/haircare`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/categories/bodycare`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.80 },
    { url: `${BASE}/categories/perfumes`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.80 },
    { url: `${BASE}/categories/electronics`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE}/categories/purses-bags`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE}/categories/wax-accessories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.70 },
    // Occasions
    { url: `${BASE}/occasions/wedding`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/occasions/party`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.70 },
    { url: `${BASE}/occasions/office`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.70 },
    { url: `${BASE}/occasions/daily`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.70 },
    { url: `${BASE}/occasions/date-night`,   lastModified: new Date(), changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/occasions/festival`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.70 },
    { url: `${BASE}/occasions/travel`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/occasions/gifting`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.70 },
    // Info pages
    { url: `${BASE}/about`,                  lastModified: new Date(), changeFrequency: "monthly", priority: 0.70 },
    { url: `${BASE}/contact`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/faq`,                    lastModified: new Date(), changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/beauty-tips`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.70 },
    { url: `${BASE}/how-to-order`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/delivery`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE}/returns`,                lastModified: new Date(), changeFrequency: "monthly", priority: 0.60 },
    { url: `${BASE}/privacy-policy`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.40 },
    { url: `${BASE}/shipping-policy`,        lastModified: new Date(), changeFrequency: "yearly",  priority: 0.40 },
    { url: `${BASE}/wishlist`,               lastModified: new Date(), changeFrequency: "weekly",  priority: 0.55 },
  ];

  const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${BASE}/products/${p.slug || p.id}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  return [...staticPages, ...productPages];
}
