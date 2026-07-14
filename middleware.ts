import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect admin dashboard pages (not the login page itself)
  const isAdminDashboard =
    pathname.startsWith("/sabs-controller") &&
    !pathname.endsWith("/sabs-controller") &&
    pathname !== "/sabs-controller";

  if (isAdminDashboard) {
    const session = req.cookies.get("sabs_session")?.value;
    if (session !== "authenticated") {
      return NextResponse.redirect(new URL("/sabs-controller", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sabs-controller/:path*"],
};
