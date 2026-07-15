import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { timestamp } = await req.json();
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "zjlchjal";

  // Sign just timestamp (simplest — no public_id to avoid slash issues)
  const signStr = `timestamp=${timestamp}${apiSecret}`;
  const signature = createHash("sha1").update(signStr).digest("hex");

  return NextResponse.json({ signature, apiKey, cloudName });
}
