import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

// ── Hugging Face BRIA RMBG-2.0 background removal ──────────────────────────
// Free tier: ~few hundred requests/hour — more than enough for 20-40 cards/day
// Model: briaai/RMBG-2.0 — state-of-the-art, product photo optimised
export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hfToken = process.env.HUGGINGFACE_API_TOKEN;
  if (!hfToken) {
    // No HF token configured — tell client to use browser-side fallback
    return NextResponse.json({ error: "no_token", fallback: true }, { status: 422 });
  }

  try {
    const body = await req.json();
    const imageBase64: string = body.imageBase64;
    const mimeType: string = body.mimeType || "image/jpeg";

    if (!imageBase64) {
      return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
    }

    const imageBuffer = Buffer.from(imageBase64, "base64");

    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/briaai/RMBG-2.0",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": mimeType,
          Accept: "image/png",
        },
        body: imageBuffer,
      }
    );

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      if (hfRes.status === 503) {
        return NextResponse.json(
          { error: "model_loading", retryAfter: 20 },
          { status: 503 }
        );
      }
      // Any other HF error — fallback to browser-side
      console.error("HF API error:", hfRes.status, errText);
      return NextResponse.json({ error: "no_token", fallback: true }, { status: 422 });
    }

    const pngBuffer = await hfRes.arrayBuffer();
    const pngBase64 = Buffer.from(pngBuffer).toString("base64");

    return NextResponse.json({ success: true, imageBase64: pngBase64, mimeType: "image/png" });

  } catch (err) {
    const msg = err instanceof Error ? err.message : "Background removal failed";
    console.error("remove-bg error:", msg);
    // On any error, fallback gracefully
    return NextResponse.json({ error: "no_token", fallback: true }, { status: 422 });
  }
}
