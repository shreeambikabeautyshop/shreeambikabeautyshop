/**
 * POST /api/admin/submit-to-search-engines
 *
 * Submits one or more URLs to ALL major search engines simultaneously:
 *   1. Google  — via Indexing API (instant crawl request, service account auth)
 *   2. Bing    — via IndexNow protocol
 *   3. Yandex  — via IndexNow protocol
 *   4. IndexNow hub — api.indexnow.org (distributes to all IndexNow members)
 *
 * Body: { urls: string[], type?: "URL_UPDATED" | "URL_DELETED" }
 * type defaults to "URL_UPDATED"
 *
 * Returns per-engine status so admin panel can show results.
 */

import { NextRequest, NextResponse } from "next/server";
import { GoogleAuth } from "google-auth-library";

const HOST          = "www.shreeambikabeauty.com";
const INDEXNOW_KEY  = "6a8a7ef7b99d788a77a16bca39eb08b1";
const KEY_LOCATION  = `https://${HOST}/${INDEXNOW_KEY}.txt`;

// ── Google Indexing API token ─────────────────────────────────────────────────
// Credentials are stored as env vars (not a file) so they work on Vercel serverless.
async function getGoogleIndexingToken(): Promise<string> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON env var is not set");
  const credentials = JSON.parse(raw);
  const auth = new GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });
  const client = await auth.getClient();
  const token  = await (client as { getAccessToken: () => Promise<{ token: string }> }).getAccessToken();
  return token.token!;
}

// ── Submit to Google Indexing API ─────────────────────────────────────────────
// Google Indexing API allows max 200 URLs/day for a service account.
// It only works for pages where the service account email is a verified owner
// in Google Search Console (delegated owner).
async function submitToGoogle(
  urls: string[],
  type: "URL_UPDATED" | "URL_DELETED" = "URL_UPDATED"
): Promise<{ success: boolean; submitted: number; failed: number; errors: string[] }> {
  try {
    const token  = await getGoogleIndexingToken();
    const errors: string[] = [];
    let submitted = 0;
    let failed    = 0;

    // Google Indexing API processes one URL per request
    // Run them in parallel (max 10 at a time to avoid rate limit)
    const chunks = [];
    for (let i = 0; i < urls.length; i += 10) {
      chunks.push(urls.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      await Promise.all(
        chunk.map(async (url) => {
          try {
            const res = await fetch(
              "https://indexing.googleapis.com/v3/urlNotifications:publish",
              {
                method:  "POST",
                headers: {
                  Authorization:  `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ url, type }),
              }
            );
            if (res.ok) {
              submitted++;
            } else {
              const errBody = await res.json().catch(() => ({}));
              failed++;
              errors.push(`${url}: ${errBody?.error?.message || res.status}`);
            }
          } catch (e) {
            failed++;
            errors.push(`${url}: ${e instanceof Error ? e.message : "unknown"}`);
          }
        })
      );
    }

    return { success: failed === 0, submitted, failed, errors };
  } catch (err) {
    return {
      success:   false,
      submitted: 0,
      failed:    urls.length,
      errors:    [err instanceof Error ? err.message : "Google auth failed"],
    };
  }
}

// ── Submit to IndexNow (Bing + Yandex + hub) ─────────────────────────────────
async function submitToIndexNow(
  urls: string[]
): Promise<{ bing: number; yandex: number; hub: number }> {
  const payload = {
    host:        HOST,
    key:         INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList:     urls,
  };
  const body    = JSON.stringify(payload);
  const headers = { "Content-Type": "application/json; charset=utf-8" };

  const [bingRes, yandexRes, hubRes] = await Promise.allSettled([
    fetch("https://www.bing.com/indexnow",     { method: "POST", headers, body }),
    fetch("https://yandex.com/indexnow",       { method: "POST", headers, body }),
    fetch("https://api.indexnow.org/indexnow", { method: "POST", headers, body }),
  ]);

  return {
    bing:   bingRes.status   === "fulfilled" ? bingRes.value.status   : 0,
    yandex: yandexRes.status === "fulfilled" ? yandexRes.value.status : 0,
    hub:    hubRes.status    === "fulfilled" ? hubRes.value.status    : 0,
  };
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const urls: string[] = body.urls || [];
    const type: "URL_UPDATED" | "URL_DELETED" = body.type || "URL_UPDATED";

    if (!urls.length) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 });
    }

    // Fire all engines in parallel — don't block on any one failing
    const [googleResult, indexNowResult] = await Promise.all([
      submitToGoogle(urls, type),
      submitToIndexNow(urls),
    ]);

    const allSuccess =
      googleResult.submitted > 0 &&
      indexNowResult.bing   === 200 &&
      indexNowResult.yandex === 202;

    return NextResponse.json({
      success: allSuccess,
      urls:    urls.length,
      engines: {
        google: {
          submitted: googleResult.submitted,
          failed:    googleResult.failed,
          errors:    googleResult.errors,
        },
        bing:    { status: indexNowResult.bing,   ok: indexNowResult.bing   === 200 },
        yandex:  { status: indexNowResult.yandex, ok: indexNowResult.yandex === 202 },
        hub:     { status: indexNowResult.hub,    ok: indexNowResult.hub    === 200 || indexNowResult.hub === 202 },
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
