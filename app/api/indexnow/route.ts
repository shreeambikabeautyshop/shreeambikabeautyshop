/**
 * POST /api/indexnow
 * Submits URLs to Bing/Yandex via IndexNow protocol for instant indexing.
 * Called after product add/update or new blog post.
 */
import { NextRequest, NextResponse } from "next/server";

const INDEXNOW_KEY  = "6a8a7ef7b99d788a77a16bca39eb08b1";
const HOST          = "www.shreeambikabeauty.com";
const KEY_LOCATION  = `https://${HOST}/${INDEXNOW_KEY}.txt`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const urls: string[] = body.urls || [];

    if (!urls.length) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
    }

    const payload = {
      host:        HOST,
      key:         INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList:     urls,
    };

    // Submit to Bing
    const bingRes = await fetch("https://www.bing.com/indexnow", {
      method:  "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body:    JSON.stringify(payload),
    });

    // Submit to Yandex (same protocol)
    const yandexRes = await fetch("https://yandex.com/indexnow", {
      method:  "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body:    JSON.stringify(payload),
    });

    return NextResponse.json({
      success: true,
      urls:    urls.length,
      bing:    bingRes.status,
      yandex:  yandexRes.status,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// GET: submit all priority pages at once
export async function GET() {
  const BASE = `https://${HOST}`;
  const priorityUrls = [
    `${BASE}/`,
    `${BASE}/products`,
    `${BASE}/dahisar-beauty-shop`,
    `${BASE}/about`,
    `${BASE}/faq`,
    `${BASE}/reviews`,
    `${BASE}/blog`,
    `${BASE}/categories/cosmetics`,
    `${BASE}/categories/skincare`,
    `${BASE}/categories/haircare`,
    `${BASE}/categories/makeup`,
    `${BASE}/categories/perfumes`,
    `${BASE}/categories/bodycare`,
    `${BASE}/categories/electronics`,
    `${BASE}/categories/purses-bags`,
    `${BASE}/categories/wax-accessories`,
    `${BASE}/beauty-tips/skin-care`,
    `${BASE}/beauty-tips/hair-care`,
    `${BASE}/beauty-tips/makeup`,
    `${BASE}/beauty-tips/buying`,
    `${BASE}/occasions/wedding`,
    `${BASE}/occasions/festival`,
    `${BASE}/occasions/party`,
    `${BASE}/occasions/gifting`,
    `${BASE}/blog/makeup-for-beginners`,
    `${BASE}/blog/how-to-spot-original-products`,
    `${BASE}/blog/best-skincare-routine-mumbai`,
    `${BASE}/blog/hair-care-tips-indian-women`,
  ];

  const payload = {
    host:        HOST,
    key:         INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList:     priorityUrls,
  };

  const [bingRes, yandexRes] = await Promise.all([
    fetch("https://www.bing.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body:    JSON.stringify(payload),
    }),
    fetch("https://yandex.com/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body:    JSON.stringify(payload),
    }),
  ]);

  return NextResponse.json({
    success: true,
    submitted: priorityUrls.length,
    bing:   bingRes.status,
    yandex: yandexRes.status,
    message: "All priority URLs submitted to Bing & Yandex via IndexNow",
  });
}
