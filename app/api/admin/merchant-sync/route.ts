/**
 * POST /api/admin/merchant-sync
 * Called automatically when a product is added/updated in admin panel.
 * Submits the product directly to Google Merchant Center via Content API.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { GoogleAuth } from "google-auth-library";

const MERCHANT_ID = "5820166508";
const BASE_URL    = "https://www.shreeambikabeauty.com";

const GOOGLE_CATEGORY: Record<string, string> = {
  "Makeup":            "2548",
  "Cosmetics":         "2548",
  "Skin Care":         "2975",
  "Hair Care":         "1680",
  "Body Care":         "567",
  "Perfumes":          "472",
  "Electronics":       "728",
  "Purses & Bags":     "187",
  "Wax & Accessories": "5081",
};

async function getMerchantToken(): Promise<string> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON env var is not set");
  const credentials = JSON.parse(raw);
  const auth = new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/content"],
  });
  const client = await auth.getClient();
  const token  = await client.getAccessToken();
  return token.token!;
}

function buildProduct(p: Record<string, unknown>) {
  const url   = `${BASE_URL}/products/${p.slug || p.id}`;
  const catId = GOOGLE_CATEGORY[p.category as string] || "2548";
  const title = `${p.brand} ${p.name}`.slice(0, 150);

  const desc = (
    (p.description as string || `${p.name} by ${p.brand}. 100% original ${p.category} product.`) +
    ` Buy from Shree Ambika Beauty Shop Mumbai. 100% original. Same day delivery Mumbai. Pan India 4-7 days. WhatsApp: +918291455297.`
  ).slice(0, 5000);

  const mrp   = (p.mrp as number) > (p.price as number) ? p.mrp : p.price;
  const price = p.price as number;

  const product: Record<string, unknown> = {
    offerId:               p.id,
    title,
    description:           desc,
    link:                  url,
    imageLink:             (p.images as string[])?.[0] || "",
    availability:          "in_stock",
    condition:             "new",
    channel:               "online",
    contentLanguage:       "en",
    targetCountry:         "IN",
    feedLabel:             "IN",
    price:                 { value: String(mrp),  currency: "INR" },
    brand:                 p.brand,
    googleProductCategory: catId,
    productTypes:          [p.category, `Beauty > ${p.category}`],
    identifierExists:      false,
    customLabel0:          p.category,
    customLabel1:          p.brand,
    customLabel2:          (p.discount as number) > 0 ? `${p.discount}pct-off` : "regular",
    customLabel4:          "shree-ambika-mumbai",
    shipping: [
      { country: "IN", service: "Standard Delivery",  price: { value: "0", currency: "INR" } },
      { country: "IN", service: "Mumbai Same Day",     price: { value: "0", currency: "INR" } },
    ],
  };

  if ((p.mrp as number) > (p.price as number)) {
    product.salePrice = { value: String(price), currency: "INR" };
    const now   = new Date();
    const later = new Date(); later.setDate(later.getDate() + 90);
    product.salePriceEffectiveDate =
      `${now.toISOString().split("T")[0]}/${later.toISOString().split("T")[0]}`;
  }

  if ((p.images as string[])?.length > 1) {
    product.additionalImageLinks = (p.images as string[]).slice(1, 11);
  }

  return product;
}

// ── POST: sync specific product or all products ───────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const productId = body.productId; // optional — if not provided, syncs all

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    let query = supabase
      .from("products")
      .select("id,name,slug,brand,category,price,mrp,discount,images,description,in_stock,tags,key_benefits,suitable_for")
      .eq("in_stock", true);

    if (productId) {
      query = query.eq("id", productId) as typeof query;
    }

    const { data: products, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!products?.length) return NextResponse.json({ message: "No products to sync" });

    const token = await getMerchantToken();

    // Batch submit
    const entries = products.map((p, idx) => ({
      batchId:    idx + 1,
      merchantId: MERCHANT_ID,
      method:     "insert",
      product:    buildProduct(p as Record<string, unknown>),
    }));

    const res = await fetch(
      "https://shoppingcontent.googleapis.com/content/v2.1/products/batch",
      {
        method:  "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ entries }),
      }
    );

    const data = await res.json();
    const results = data.entries || [];
    const ok   = results.filter((r: Record<string, unknown>) => !r.errors).length;
    const fail = results.filter((r: Record<string, unknown>) =>  r.errors).length;

    return NextResponse.json({
      success: true,
      synced:  ok,
      failed:  fail,
      total:   products.length,
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── GET: check sync status ────────────────────────────────────────────────────
export async function GET() {
  try {
    const token = await getMerchantToken();
    const res   = await fetch(
      `https://shoppingcontent.googleapis.com/content/v2.1/${MERCHANT_ID}/products?maxResults=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data  = await res.json();
    return NextResponse.json({
      status:        "connected",
      merchantId:    MERCHANT_ID,
      totalProducts: data.nextPageToken ? "100+" : (data.resources?.length || 0),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
