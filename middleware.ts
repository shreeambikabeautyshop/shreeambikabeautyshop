import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never block admin, api, static, or homepage
  if (
    pathname.startsWith("/sabs-controller") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Check site_mode from site_settings via API
  try {
    const res = await fetch(`${req.nextUrl.origin}/api/settings`);
    if (res.ok) {
      const data = await res.json();
      if (data.site_mode === "home_only") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  } catch { /* allow through on error */ }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
