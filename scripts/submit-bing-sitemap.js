/**
 * submit-bing-sitemap.js
 * ─────────────────────────────────────────────────────
 * Submits sitemap + key URLs to Bing Webmaster Tools
 * Bing = 15-20% of India search traffic (after Google)
 *
 * Setup:
 * 1. Go to https://www.bing.com/webmasters
 * 2. Add your site: https://www.shreeambikabeauty.com
 * 3. Settings → API Access → Generate API Key
 * 4. Add to .env.local: BING_WEBMASTER_API_KEY=your_key
 *
 * Run: node scripts/submit-bing-sitemap.js
 * ─────────────────────────────────────────────────────
 */

require("dotenv").config({ path: ".env.local" });

const BING_API_KEY = process.env.BING_WEBMASTER_API_KEY;
const SITE_URL     = "https://www.shreeambikabeauty.com";

const PRIORITY_URLS = [
  "/",
  "/products",
  "/dahisar-beauty-shop",
  "/about",
  "/faq",
  "/reviews",
  "/blog",
  "/categories/cosmetics",
  "/categories/skincare",
  "/categories/haircare",
  "/categories/makeup",
  "/categories/perfumes",
  "/categories/bodycare",
  "/beauty-tips/skin-care",
  "/beauty-tips/hair-care",
  "/beauty-tips/makeup",
  "/occasions/wedding",
  "/occasions/festival",
  "/blog/makeup-for-beginners",
  "/blog/how-to-spot-original-products",
];

async function main() {
  if (!BING_API_KEY) {
    console.log("⚠️  BING_WEBMASTER_API_KEY not set in .env.local");
    console.log("\nTo get your key:");
    console.log("1. Go to https://www.bing.com/webmasters");
    console.log("2. Add site: https://www.shreeambikabeauty.com");
    console.log("3. Settings → API Access → Generate API Key");
    console.log("4. Add to .env.local: BING_WEBMASTER_API_KEY=your_key");
    console.log("\nThen run this script again.");
    return;
  }

  console.log("🔵 Submitting to Bing Webmaster...\n");

  // Submit sitemap
  const sitemapRes = await fetch(
    `https://ssl.bing.com/webmaster/api.svc/json/SubmitSitemap?apikey=${BING_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        siteUrl: SITE_URL,
        sitemap: `${SITE_URL}/sitemap.xml`,
      }),
    }
  );
  const sitemapData = await sitemapRes.json();
  console.log("Sitemap:", sitemapData.d === true ? "✅ Submitted" : "⚠️ " + JSON.stringify(sitemapData));

  // Submit URLs for instant indexing
  const urlRes = await fetch(
    `https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey=${BING_API_KEY}`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        siteUrl: SITE_URL,
        urlList: PRIORITY_URLS.map(p => SITE_URL + p),
      }),
    }
  );
  const urlData = await urlRes.json();
  console.log(`URLs (${PRIORITY_URLS.length}):`, urlData.d === true ? "✅ Submitted" : "⚠️ " + JSON.stringify(urlData));

  console.log("\n✅ Done! Bing will crawl these pages within 24-48 hours.");
}

main().catch(err => console.error("❌", err.message));
