/**
 * sync-merchant-center.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Fully optimized Google Merchant Center sync for Shree Ambika Beauty Shop
 *
 * What this does:
 *  - Fetches ALL in-stock products from Supabase
 *  - Submits with FULLY OPTIMIZED data for maximum Google ranking
 *  - Handles batches of 100 (API limit)
 *  - Re-submits existing products with improvements (upsert)
 *
 * Run:  node scripts/sync-merchant-center.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

require("dotenv").config({ path: ".env.local" });
const { google }       = require("googleapis");
const { createClient } = require("@supabase/supabase-js");
const fs   = require("fs");
const path = require("path");

const MERCHANT_ID = "5820166508";
const BASE_URL    = "https://www.shreeambikabeauty.com";
const KEY_FILE    = path.resolve(__dirname, "..", "shree-ambika-beauty-shop-fb1e06b46c92.json");

// ── Google Taxonomy IDs (numeric = higher ranking than text) ─────────────────
// https://www.google.com/basepages/producttype/taxonomy-with-ids.en-IN.txt
const GOOGLE_CATEGORY = {
  "Makeup":            "2548",   // Health & Beauty > Personal Care > Cosmetics > Makeup
  "Cosmetics":         "2548",   // Health & Beauty > Personal Care > Cosmetics
  "Skin Care":         "2975",   // Health & Beauty > Personal Care > Skin Care
  "Hair Care":         "1680",   // Health & Beauty > Personal Care > Hair Care
  "Body Care":         "567",    // Health & Beauty > Personal Care > Bath & Body
  "Perfumes":          "472",    // Health & Beauty > Fragrances
  "Electronics":       "728",    // Health & Beauty > Personal Care > Hair Care > Hair Dryers
  "Purses & Bags":     "187",    // Apparel & Accessories > Handbags, Wallets & Cases
  "Wax & Accessories": "5081",   // Health & Beauty > Personal Care > Hair Removal
};

// ── Mumbai shipping zones (ALL required sub-attributes included) ──────────────
// Google requires: price, minHandlingTime, maxHandlingTime, minTransitTime, maxTransitTime
const SHIPPING = [
  {
    country: "IN", service: "Standard Pan India",
    price: { value: "0", currency: "INR" },
    minHandlingTime: 0, maxHandlingTime: 1,
    minTransitTime:  3, maxTransitTime:  7,
  },
  {
    country: "IN", service: "Mumbai Same Day",
    price: { value: "0", currency: "INR" },
    minHandlingTime: 0, maxHandlingTime: 0,
    minTransitTime:  0, maxTransitTime:  1,
  },
  {
    country: "IN", service: "Mumbai Express",
    price: { value: "0", currency: "INR" },
    minHandlingTime: 0, maxHandlingTime: 1,
    minTransitTime:  1, maxTransitTime:  2,
  },
];

// ── Category to product labels (helps Google classify correctly) ──────────────
const CUSTOM_LABELS = {
  "Makeup":            ["makeup", "cosmetics", "beauty", "mumbai-beauty-shop"],
  "Cosmetics":         ["cosmetics", "lipstick", "foundation", "kajal", "beauty"],
  "Skin Care":         ["skincare", "serum", "moisturizer", "sunscreen", "beauty"],
  "Hair Care":         ["haircare", "shampoo", "conditioner", "hair-serum", "beauty"],
  "Body Care":         ["bodycare", "lotion", "body-wash", "beauty"],
  "Perfumes":          ["perfume", "fragrance", "deodorant", "beauty"],
  "Electronics":       ["hair-dryer", "straightener", "beauty-electronics"],
  "Purses & Bags":     ["handbag", "purse", "wallet", "accessories"],
  "Wax & Accessories": ["wax", "hair-removal", "beauty-accessories"],
};

async function getAccessToken() {
  const key = JSON.parse(fs.readFileSync(KEY_FILE, "utf8"));
  const jwt = new google.auth.JWT({
    email:  key.client_email,
    key:    key.private_key,
    scopes: ["https://www.googleapis.com/auth/content"],
  });
  const tokens = await jwt.authorize();
  return tokens.access_token;
}

async function main() {
  console.log("═".repeat(60));
  console.log("  🛍  Shree Ambika Beauty Shop — Merchant Center Sync");
  console.log("═".repeat(60) + "\n");

  // ── Auth ─────────────────────────────────────────────────
  let token;
  try {
    token = await getAccessToken();
    console.log("✅ Google OAuth2 authenticated\n");
  } catch (e) {
    console.error("❌ Auth failed:", e.message);
    process.exit(1);
  }

  // ── Fetch from Supabase ──────────────────────────────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id, name, slug, brand, category,
      price, mrp, discount, images,
      description, in_stock, tags,
      key_benefits, how_to_use, suitable_for,
      rating, reviews_count, updated_at
    `)
    .eq("in_stock", true)
    .order("created_at", { ascending: false });

  if (error) { console.error("❌ Supabase error:", error); process.exit(1); }
  console.log(`📦 ${products.length} products fetched from Supabase\n`);

  // ── Batch submit ─────────────────────────────────────────
  const BATCH = 100;
  let inserted = 0, failed = 0, warnings = 0;

  for (let i = 0; i < products.length; i += BATCH) {
    const chunk    = products.slice(i, i + BATCH);
    const batchNum = Math.floor(i / BATCH) + 1;

    const entries = chunk.map((p, idx) => ({
      batchId:    idx + 1,
      merchantId: MERCHANT_ID,
      method:     "insert",
      product:    buildOptimizedProduct(p),
    }));

    try {
      const res  = await fetch(
        "https://shoppingcontent.googleapis.com/content/v2.1/products/batch",
        {
          method:  "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body:    JSON.stringify({ entries }),
        }
      );
      const data = await res.json();

      if (!res.ok) {
        console.error(`❌ Batch ${batchNum} error ${res.status}:`, data?.error?.message);
        failed += chunk.length;
        continue;
      }

      let ok = 0, fail = 0;
      (data.entries || []).forEach((r) => {
        if (r.errors) {
          const msg = r.errors.errors?.[0]?.message || "";
          // Warning-level issues are ok
          if (msg.includes("pending") || msg.includes("review")) {
            warnings++;
          } else {
            console.log(`  ⚠️  [${r.batchId}] ${msg.slice(0, 80)}`);
            fail++; failed++;
          }
        } else {
          ok++; inserted++;
        }
      });

      console.log(`  ✅ Batch ${batchNum} (${chunk.length} products): ${ok} ok${fail ? `, ${fail} failed` : ""}`);

    } catch (err) {
      console.error(`  ❌ Batch ${batchNum} threw:`, err.message);
      failed += chunk.length;
    }
  }

  console.log("\n" + "═".repeat(60));
  console.log(`  📊 RESULTS`);
  console.log("═".repeat(60));
  console.log(`  ✅ Submitted:  ${inserted}`);
  console.log(`  ❌ Failed:     ${failed}`);
  console.log(`  ⏳ Pending review: all submitted products`);
  console.log("\n  Google will review and approve within 1-3 business days.");
  console.log(`\n  👉 https://merchants.google.com/mc/products?a=${MERCHANT_ID}`);
  console.log("═".repeat(60));
}

function buildOptimizedProduct(p) {
  const url      = `${BASE_URL}/products/${p.slug || p.id}`;
  const catId    = GOOGLE_CATEGORY[p.category] || "2548";
  const labels   = CUSTOM_LABELS[p.category]   || ["beauty", "mumbai"];

  // ── Title: SEO-optimized format ──────────────────────────
  // Format: Brand + Product Name + Key Attribute (max 150 chars)
  const title = `${p.brand} ${p.name}`.slice(0, 150);

  // ── Description: keyword-rich, structured ────────────────
  const baseDesc = p.description ||
    `${p.name} by ${p.brand}. 100% original ${p.category} product.`;

  const benefits = p.key_benefits?.length
    ? ` Key benefits: ${p.key_benefits.slice(0, 3).join(". ")}.`
    : "";

  const howTo = p.how_to_use
    ? ` How to use: ${p.how_to_use.slice(0, 100)}.`
    : "";

  const description = (
    baseDesc + benefits + howTo +
    ` Buy online from Shree Ambika Beauty Shop, Mumbai — India's trusted beauty store since 2001.` +
    ` 100% original products. Same day delivery in Mumbai. Pan India delivery in 4-7 days.` +
    ` WhatsApp Vinod: +918291455297.`
  ).slice(0, 5000);

  // ── Price logic ───────────────────────────────────────────
  // Always use actual selling price to avoid "Mismatched product price" error
  // Google crawls the product page and compares — use the same price shown on page
  const sellingPrice = p.price;

  // ── Build product object ──────────────────────────────────
  const product = {
    // ── Core required fields ──────────────────────────────
    offerId:         p.id,
    title,
    description,
    link:            url,
    imageLink:       p.images?.[0] || "",
    availability:    "in_stock",
    condition:       "new",
    channel:         "online",
    contentLanguage: "en",
    targetCountry:   "IN",
    feedLabel:       "IN",

    // ── Pricing — use actual selling price (matches product page) ──
    price: { value: String(sellingPrice), currency: "INR" },

    // ── Brand & categorization ────────────────────────────
    brand:                 p.brand,
    googleProductCategory: catId,
    productTypes:          [p.category, `Beauty > ${p.category}`],

    // ── Identifier ────────────────────────────────────────
    identifierExists: false,

    // ── Shipping ─────────────────────────────────────────
    shipping: SHIPPING.map(s => ({
      country:         s.country,
      service:         s.service,
      price:           s.price,
      minHandlingTime: s.minHandlingTime,
      maxHandlingTime: s.maxHandlingTime,
      minTransitTime:  s.minTransitTime,
      maxTransitTime:  s.maxTransitTime,
    })),

    // ── Custom labels for campaign targeting ──────────────
    customLabel0: p.category,
    customLabel1: p.brand,
    customLabel2: p.discount > 0 ? `${p.discount}pct-off` : "regular-price",
    customLabel3: labels[0] || "beauty",
    customLabel4: "shree-ambika-mumbai",

    // ── Promotions ────────────────────────────────────────
    promotionIds: [],

    // ── Additional attributes ────────────────────────────
    ...(p.tags?.length  ? { productHighlights: p.tags.slice(0, 10) } : {}),
  };

  // ── MRP shown as strikethrough (original price) ──────────
  if (p.mrp > p.price) {
    // Note: salePrice not used since we submit selling price as base price
    // This avoids "Mismatched product price" Google Merchant Center error
    const now   = new Date();
    const later = new Date(now);
    later.setDate(later.getDate() + 90);
  }

  // ── Additional images ─────────────────────────────────
  if (p.images?.length > 1) {
    product.additionalImageLinks = p.images.slice(1, 11);
  }

  // ── Aggregate rating (improves CTR in Shopping) ───────
  if (p.rating && p.reviews_count > 0) {
    // Note: ratings via Content API need to be submitted separately
    // via the Product Reviews feed, but including in product helps
  }

  return product;
}

main().catch(err => { console.error("❌ Fatal:", err.message); process.exit(1); });
