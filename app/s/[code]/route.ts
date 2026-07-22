import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  const { code } = params;
  if (!code) return NextResponse.redirect("https://www.shreeambikabeauty.com");

  const supabase = getAdmin();

  // Get the link
  const { data, error } = await supabase
    .from("short_links")
    .select("original_url, id, clicks")
    .eq("code", code)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.redirect("https://www.shreeambikabeauty.com");
  }

  // Detect source from referrer header
  const referer  = req.headers.get("referer") || "";
  const ua       = req.headers.get("user-agent") || "";
  const ip       = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  let source = "direct";
  if (referer.includes("wa.me") || referer.includes("whatsapp")) source = "whatsapp";
  else if (referer.includes("facebook") || referer.includes("fb.com")) source = "facebook";
  else if (referer.includes("instagram")) source = "instagram";
  else if (referer.includes("t.me") || referer.includes("telegram")) source = "telegram";
  else if (referer.includes("twitter") || referer.includes("x.com")) source = "twitter";
  else if (referer) source = "other";

  // Log click asynchronously (don't await — keep redirect fast)
  supabase.from("short_link_clicks").insert({
    link_id:    data.id,
    code,
    source,
    referer:    referer || null,
    user_agent: ua || null,
    ip_address: ip,
  }).then(({ error: e }) => {
    if (e) console.error("[short-link click]", e.message);
  });

  // Increment click counter asynchronously
  supabase.from("short_links")
    .update({ clicks: (data.clicks || 0) + 1 })
    .eq("code", code)
    .then(() => {});

  // 301 permanent redirect → SEO safe, Google follows to original URL
  return NextResponse.redirect(data.original_url, { status: 301 });
}
