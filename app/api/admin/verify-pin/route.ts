import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();

    if (!pin || typeof pin !== "string") {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const adminPin = process.env.ADMIN_PIN;
    if (pin === adminPin) {
      // Set a session cookie valid for 8 hours
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
