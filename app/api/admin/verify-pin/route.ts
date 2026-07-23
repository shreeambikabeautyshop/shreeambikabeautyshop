import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(req: NextRequest) {
  // Extract IP
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const userAgent = req.headers.get("user-agent") || "unknown";

  try {
    const { pin } = await req.json();

    if (!pin || typeof pin !== "string") {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const adminPin = process.env.ADMIN_PIN;
    const success = pin === adminPin;

    // ── Log every login attempt to Supabase ──
    try {
      const supabase = getAdmin();
      await supabase.from("admin_login_attempts").insert({
        ip_address: ip,
        user_agent: userAgent,
        success,
        attempted_at: new Date().toISOString(),
      });
    } catch {
      // Don't fail the login if logging fails
    }

    if (success) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("sabs_session", "authenticated", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 8, // 8 hours
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ success: false, message: "Invalid access code" }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
