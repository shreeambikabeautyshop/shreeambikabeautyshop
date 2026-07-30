/**
 * Generates SEO + GEO + AEO optimized Cloudinary public_id for product images/videos.
 *
 * Formula: buy-{product-name}-{brand}-{category}-mumbai-india-original-shreeambika-{uid}
 *
 * This makes Cloudinary URLs rank for:
 * - SEO: product name + brand + category keywords in URL
 * - GEO: "mumbai" + "india" for local/hyperlocal search signals
 * - AEO: "original" + "shreeambika" for brand entity recognition by AI engines
 *
 * Example output:
 *   shreeambika-products/buy-lakme-absolute-matte-revolution-lip-color-cosmetics-mumbai-india-original-shreeambika-k7x2p
 */

const GEO_SUFFIX = "mumbai-india-original-shreeambika";

function toSlug(text: string, maxLen = 50): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")   // remove special chars
    .replace(/\s+/g, "-")            // spaces → hyphens
    .replace(/-+/g, "-")             // collapse multiple hyphens
    .replace(/^-|-$/g, "")           // trim leading/trailing hyphens
    .slice(0, maxLen);
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

interface ProductMeta {
  name: string;
  brand?: string;
  category?: string;
}

/**
 * Returns a SEO/GEO/AEO optimised Cloudinary public_id for a product IMAGE.
 * e.g. "shreeambika-products/buy-lakme-lipstick-cosmetics-mumbai-india-original-shreeambika-k7x2p-0"
 */
export function productImagePublicId(meta: ProductMeta, index = 0): string {
  const name     = toSlug(meta.name || "beauty-product", 40);
  const brand    = meta.brand    ? toSlug(meta.brand, 15)    : "";
  const category = meta.category ? toSlug(meta.category, 15) : "";

  const parts = ["buy", name, brand, category, GEO_SUFFIX].filter(Boolean);
  const base  = parts.join("-").slice(0, 90);

  return `shreeambika-products/${base}-${uid()}-${index}`;
}

/**
 * Returns a SEO/GEO/AEO optimised Cloudinary public_id for a product VIDEO.
 * e.g. "shreeambika-videos/demo-lakme-lipstick-cosmetics-mumbai-india-original-shreeambika-k7x2p"
 */
export function productVideoPublicId(meta: ProductMeta): string {
  const name     = toSlug(meta.name || "beauty-product", 40);
  const brand    = meta.brand    ? toSlug(meta.brand, 15)    : "";
  const category = meta.category ? toSlug(meta.category, 15) : "";

  const parts = ["demo", name, brand, category, GEO_SUFFIX].filter(Boolean);
  const base  = parts.join("-").slice(0, 90);

  return `shreeambika-videos/${base}-${uid()}`;
}
