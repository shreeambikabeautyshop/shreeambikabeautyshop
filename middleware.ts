import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CANONICAL_HOST = "www.shreeambikabeauty.com";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // ── Canonical host enforcement ───────────────────────────────────────────
  // Redirect http:// → https:// and non-www → www before anything else.
  // This runs in middleware (edge) so it is guaranteed regardless of proxy headers.
  const host = req.headers.get("host") || "";
  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol.replace(":", "");

  const isNonCanonicalHost = host && host !== CANONICAL_HOST && !host.startsWith("localhost") && !host.startsWith("127.");
  const isHttp = proto === "http";

  if (isNonCanonicalHost || isHttp) {
    const canonicalUrl = `https://${CANONICAL_HOST}${pathname}${search}`;
    return NextResponse.redirect(canonicalUrl, { status: 301 });
  }

  // Never block these paths
  if (
    pathname.startsWith("/sabs-controller") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Check site_mode directly from Supabase (no circular API call)
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_mode")
      .single();

    if (data?.value === "home_only") {
      // ── SEO-safe maintenance mode ────────────────────────────────────────
      // Use 503 + Retry-After for search engine bots so Google knows the
      // site is temporarily unavailable and does NOT deindex pages.
      // For real users, redirect to homepage as before.
      const ua = req.headers.get("user-agent") || "";
      const isBot = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|sogou|exabot|facebot|ia_archiver|GPTBot|ClaudeBot|PerplexityBot/i.test(ua);
      if (isBot) {
        return new NextResponse("Service temporarily unavailable", {
          status: 503,
          headers: {
            "Retry-After": "3600",
            "Content-Type": "text/plain",
          },
        });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  } catch { /* allow through on error */ }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
