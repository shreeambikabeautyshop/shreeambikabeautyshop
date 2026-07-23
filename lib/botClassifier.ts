/**
 * Bot/Human classifier — runs BEFORE saving to DB
 *
 * 3-layer approach (fastest first):
 *   Layer 1: Hard rules (known bots by UA string) — instant, no API
 *   Layer 2: Heuristic signals — instant, no API
 *   Layer 3: Groq LLM — only when genuinely ambiguous
 *
 * Returns:
 *   type: "human" | "good_bot" | "bad_bot"
 *   reason: short explanation
 *   confidence: 0–1
 */

export type VisitorType = "human" | "good_bot" | "bad_bot";

export interface ClassifyResult {
  type: VisitorType;
  reason: string;
  confidence: number;
}

// ── LAYER 1: Known UA patterns ────────────────────────────────────────────────

const GOOD_BOT_UA = [
  /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i, /baiduspider/i,
  /yandexbot/i, /sogou/i, /exabot/i, /facebot/i, /ia_archiver/i,
  /linkedinbot/i, /twitterbot/i, /whatsapp/i, /telegrambot/i,
  /applebot/i, /semrushbot/i, /ahrefsbot/i, /mj12bot/i,
  /petalbot/i, /google-inspectiontool/i, /googleother/i,
];

const BAD_BOT_UA = [
  /scrapy/i, /wget/i, /curl\//i, /python-requests/i, /python-urllib/i,
  /go-http-client/i, /java\//i, /httpclient/i, /libwww-perl/i,
  /nikto/i, /sqlmap/i, /nmap/i, /masscan/i, /zgrab/i, /nuclei/i,
  /dirbuster/i, /dirb\//i, /hydra/i, /burpsuite/i, /w3af/i,
  /acunetix/i, /nessus/i, /openvas/i, /metasploit/i,
  /bot\/[0-9]/i, /spider\/[0-9]/i, /crawler\/[0-9]/i,
];

// Known datacenter ASN city names that are NEVER real customers
const DATACENTER_CITIES = [
  "Roubaix", "Gravelines", "Strasbourg",           // OVH France
  "Boardman", "The Dalles", "Council Bluffs",       // AWS/Google US
  "Ashburn", "Herndon", "Reston",                   // AWS/Equinix US
  "Des Moines", "Quincy",                           // Microsoft/Google
  "Mountain View",                                  // Google HQ
  "Altoona",                                        // Facebook DC
  "Villeurbanne",                                   // OVH
];

// ── LAYER 2: Heuristic scoring ────────────────────────────────────────────────

function heuristicScore(ua: string, ip: string, city: string, isp: string): {
  score: number; // > 0 = more bot-like, < 0 = more human-like
  signals: string[];
} {
  let score = 0;
  const signals: string[] = [];

  if (!ua || ua === "unknown" || ua.length < 20) {
    score += 3; signals.push("missing/short UA");
  }

  if (DATACENTER_CITIES.includes(city)) {
    score += 4; signals.push(`datacenter city: ${city}`);
  }

  const ispLower = (isp || "").toLowerCase();
  if (/ovh|hetzner|digitalocean|linode|vultr|amazon|google|microsoft|cloudflare|akamai|fastly|contabo|scaleway|leaseweb/.test(ispLower)) {
    score += 2; signals.push(`datacenter ISP: ${isp}`);
  }

  // UA has no real browser fingerprint
  if (ua && !/mozilla/i.test(ua)) {
    score += 2; signals.push("non-browser UA");
  }

  // Looks like a real browser (negative = more human)
  if (/chrome|firefox|safari|edge/i.test(ua) && /windows|mac|android|iphone|linux/i.test(ua)) {
    score -= 3; signals.push("real browser UA");
  }

  // Mobile signals = almost certainly human
  if (/android|iphone|ipad|mobile/i.test(ua)) {
    score -= 2; signals.push("mobile device");
  }

  return { score, signals };
}

// ── LAYER 3: Groq classification (only for ambiguous cases) ──────────────────

async function groqClassify(ua: string, ip: string, city: string, country: string, isp: string): Promise<ClassifyResult> {
  try {
    const { groqText } = await import("@/lib/groq");
    const prompt = `You are a web traffic classifier for an Indian beauty shop website.

Classify this visitor as exactly one of: "human", "good_bot", or "bad_bot"

Rules:
- "human" = real person using a browser (Chrome, Firefox, Safari, Edge on Windows/Mac/Android/iOS)
- "good_bot" = legitimate crawler that brings SEO value (Googlebot, Bingbot, social media crawlers, SEO tools)
- "bad_bot" = scraper, attacker, spam bot, or malicious crawler that gives no value

Input:
User-Agent: ${ua}
IP: ${ip}
City: ${city}, ${country}
ISP: ${isp}

Respond with ONLY raw JSON, no markdown:
{"type":"human","reason":"one sentence","confidence":0.95}`;

    const raw = await groqText(prompt, 80, 0.1);
    const match = raw.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error("no json");
    const parsed = JSON.parse(match[0]);
    return {
      type: parsed.type as VisitorType,
      reason: parsed.reason || "groq classified",
      confidence: parsed.confidence || 0.8,
    };
  } catch {
    // Groq failed — default to human (don't drop real visitors)
    return { type: "human", reason: "groq unavailable — defaulting to human", confidence: 0.5 };
  }
}

// ── MAIN CLASSIFIER ───────────────────────────────────────────────────────────

export async function classifyVisitor(params: {
  ua: string;
  ip: string;
  city: string;
  country: string;
  isp: string;
}): Promise<ClassifyResult> {
  const { ua, ip, city, country, isp } = params;
  const uaLower = (ua || "").toLowerCase();

  // Layer 1a: Hard good-bot match
  if (GOOD_BOT_UA.some((r) => r.test(uaLower))) {
    return { type: "good_bot", reason: `known good bot UA: ${ua.slice(0, 60)}`, confidence: 0.99 };
  }

  // Layer 1b: Hard bad-bot match
  if (BAD_BOT_UA.some((r) => r.test(uaLower))) {
    return { type: "bad_bot", reason: `known bad bot/scanner UA: ${ua.slice(0, 60)}`, confidence: 0.99 };
  }

  // Layer 2: Heuristic
  const { score, signals } = heuristicScore(ua, ip, city, isp);

  if (score >= 5) {
    // Very likely bot — no need for Groq
    return {
      type: "bad_bot",
      reason: `heuristic signals: ${signals.join(", ")}`,
      confidence: Math.min(0.7 + score * 0.05, 0.97),
    };
  }

  if (score <= -2) {
    // Very likely human — no need for Groq
    return {
      type: "human",
      reason: `real browser signals: ${signals.join(", ")}`,
      confidence: Math.min(0.7 + Math.abs(score) * 0.05, 0.97),
    };
  }

  // Layer 3: Ambiguous — ask Groq
  return await groqClassify(ua, ip, city, country, isp);
}
