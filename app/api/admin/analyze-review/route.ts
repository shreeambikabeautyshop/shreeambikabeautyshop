import { NextRequest, NextResponse } from "next/server";

function isAuthenticated(req: NextRequest): boolean {
  return req.cookies.get("sabs_session")?.value === "authenticated";
}

const PROMPT = `You are analyzing a customer review image for "Shree Ambika Beauty Shop" Mumbai (WhatsApp: +918291455297).

This image could be:
- A WhatsApp chat screenshot showing an order conversation
- A customer selfie with a product
- A handwritten/typed review
- An order confirmation or delivery photo
- A before/after photo

Extract as much as you can. Return ONLY raw JSON (no markdown):
{
  "reviewer_name": "Customer's name if visible in the image (from WhatsApp contact name, text, or any label). If not visible, return empty string.",
  "location": "City or area if mentioned (e.g. Mumbai, Thane, Delhi, Dubai). Empty string if not found.",
  "review_text": "Any review text, message, or feedback visible in the image. Summarize WhatsApp conversation into 1-2 sentences of positive feedback if it shows a purchase. Empty string if none.",
  "order_type": "One of: Single Item, Bulk Order, Repeat Order, Gift Order, Pan India, International. Detect from context: multiple items = Bulk Order, mentions ordering again = Repeat Order, mentions delivery to another city = Pan India, mentions abroad = International. Default to Single Item.",
  "confidence": "high, medium, or low — how confident you are about the extracted data"
}`;

export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
  }

  const body = await req.json();
  const { imageBase64, mimeType = "image/jpeg" } = body;

  if (!imageBase64) {
    return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "qwen/qwen3.6-27b",
        messages: [{
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            { type: "text", text: PROMPT },
          ],
        }],
        temperature: 0.3,
        max_tokens: 512,
        reasoning_effort: "none",
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Groq error");

    const raw = data.choices?.[0]?.message?.content || "";
    // Strip <think>...</think> blocks (qwen model thinking output)
    const stripped = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    const cleaned = stripped.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
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
