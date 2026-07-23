import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE = "https://www.shreeambikabeauty.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all published products
  const { data: products } = await supabase
    .from("products")
    .select("slug,id,updated_at")
    .order("updated_at", { ascending: false });

  // Fetch all published blog posts
  const { data: blogs } = await supabase
    .from("blog_posts")
    .select("slug,updated_at,created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  // ── Static pages that ACTUALLY EXIST ────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    // Homepage — highest priority
    { url: BASE,                                    lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    // Core pages
    { url: `${BASE}/products`,                      lastModified: new Date(), changeFrequency: "daily",   priority: 0.95 },
    { url: `${BASE}/blog`,                          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.80 },
    { url: `${BASE}/wishlist`,                      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.50 },
    // About / Info pages
    { url: `${BASE}/about`,                         lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/contact`,                       lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/faq`,                           lastModified: new Date(), changeFrequency: "monthly", priority: 0.70 },
    { url: `${BASE}/how-to-order`,                  lastModified: new Date(), changeFrequency: "monthly", priority: 0.70 },
    { url: `${BASE}/delivery`,                      lastModified: new Date(), changeFrequency: "monthly", priority: 0.70 },
    { url: `${BASE}/returns`,                       lastModified: new Date(), changeFrequency: "monthly", priority: 0.65 },
    // Beauty Tips
    { url: `${BASE}/beauty-tips`,                   lastModified: new Date(), changeFrequency: "weekly",  priority: 0.78 },
    { url: `${BASE}/beauty-tips/skin-care`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE}/beauty-tips/hair-care`,         lastModified: new Date(), changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE}/beauty-tips/makeup`,            lastModified: new Date(), changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE}/beauty-tips/buying`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.70 },
    // Occasions
    { url: `${BASE}/occasions/wedding`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.78 },
    { url: `${BASE}/occasions/party`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/occasions/office`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.73 },
    { url: `${BASE}/occasions/daily`,               lastModified: new Date(), changeFrequency: "monthly", priority: 0.73 },
    { url: `${BASE}/occasions/date-night`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.70 },
    { url: `${BASE}/occasions/festival`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/occasions/travel`,              lastModified: new Date(), changeFrequency: "monthly", priority: 0.68 },
    { url: `${BASE}/occasions/gifting`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.72 },
    // Categories
    { url: `${BASE}/categories/makeup`,             lastModified: new Date(), changeFrequency: "weekly",  priority: 0.88 },
    { url: `${BASE}/categories/skincare`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.88 },
    { url: `${BASE}/categories/haircare`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/categories/cosmetics`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.85 },
    { url: `${BASE}/categories/bodycare`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.82 },
    { url: `${BASE}/categories/perfumes`,           lastModified: new Date(), changeFrequency: "weekly",  priority: 0.82 },
    { url: `${BASE}/categories/electronics`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE}/categories/purses-bags`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.75 },
    { url: `${BASE}/categories/wax-accessories`,    lastModified: new Date(), changeFrequency: "weekly",  priority: 0.70 },
  ];

  // ── Product detail pages (dynamic from DB) ────────────────────────────────
  const productPages: MetadataRoute.Sitemap = (products || []).map((p) => ({
    url: `${BASE}/products/${p.slug || p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.85,
  }));

  // ── Blog detail pages (dynamic from DB) ───────────────────────────────────
  const blogPages: MetadataRoute.Sitemap = (blogs || []).map((b) => ({
    url: `${BASE}/blog/${b.slug}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : new Date(b.created_at),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticPages, ...productPages, ...blogPages];
}
