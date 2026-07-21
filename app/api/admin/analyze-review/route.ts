import { NextRequest, NextResponse } from "next/server";
import { groqVision } from "@/lib/groq";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

const PROMPT = `You are analyzing a customer review image for "Shree Ambika Beauty Shop" Mumbai (WhatsApp: +918291455297).

This image could be a WhatsApp chat screenshot, customer selfie with product, handwritten/typed review, order confirmation, or delivery photo.

Extract as much as you can. Return ONLY raw JSON (no markdown):
{
  "reviewer_name": "Customer name if visible (WhatsApp contact name, text, or any label). Empty string if not found.",
  "location": "City or area if mentioned (Mumbai, Thane, Delhi, Dubai etc). Empty string if not found.",
  "review_text": "Any review text, message or feedback visible. Summarize WhatsApp conversation into 1-2 positive sentences if it shows a purchase. Empty string if none.",
  "order_type": "One of: Single Item, Bulk Order, Repeat Order, Gift Order, Pan India, International. Detect from context. Default: Single Item.",
  "confidence": "high, medium, or low"
}`;

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { imageBase64, mimeType = "image/jpeg" } = body;
  if (!imageBase64) return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });

  try {
    const raw = await groqVision(imageBase64, mimeType, PROMPT, 512, 0.3);
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Could not parse AI response");
    const result = JSON.parse(match[0]);
    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI analysis failed" },
      { status: 500 }
    );
  }
}
