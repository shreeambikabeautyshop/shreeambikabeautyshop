/**
 * seo-report.js
 * ─────────────────────────────────────────────────────
 * Full SEO health report for Shree Ambika Beauty Shop
 * Pulls data from:
 *   - Google Search Console (clicks, impressions, rankings)
 *   - Google Analytics (traffic, bounce rate)
 *   - Google Merchant Center (product status)
 *
 * Run: node scripts/seo-report.js
 * ─────────────────────────────────────────────────────
 */

require("dotenv").config({ path: ".env.local" });
const { google } = require("googleapis");
const fs   = require("fs");
const path = require("path");

const KEY_FILE   = path.resolve(__dirname, "..", "shree-ambika-beauty-shop-fb1e06b46c92.json");
const GSC_SITE   = "sc-domain:shreeambikabeauty.com";
const GA_PROP    = "properties/545964476";
const MERCHANT   = "5820166508";
const BASE       = "https://www.shreeambikabeauty.com";

async function getToken(scopes) {
  const key = JSON.parse(fs.readFileSync(KEY_FILE, "utf8"));
  const jwt = new google.auth.JWT({ email: key.client_email, key: key.private_key, scopes });
  const t = await jwt.authorize();
  return t.access_token;
}

function pad(str, len) { return String(str).padEnd(len); }
function truncate(str, len) { return String(str).length > len ? String(str).slice(0, len - 1) + "…" : String(str); }

async function main() {
  const today      = new Date().toISOString().split("T")[0];
  const last28     = new Date(Date.now() - 28 * 86400000).toISOString().split("T")[0];
  const last7      = new Date(Date.now() -  7 * 86400000).toISOString().split("T")[0];
  const launchDate = "2026-07-17";

  console.log("═".repeat(65));
  console.log("  📊 SHREE AMBIKA BEAUTY SHOP — SEO REPORT");
  console.log(`  Generated: ${new Date().toLocaleString("en-IN")}`);
  console.log("═".repeat(65));

  // ── 1. GOOGLE SEARCH CONSOLE ───────────────────────
  try {
    const gscToken = await getToken(["https://www.googleapis.com/auth/webmasters.readonly"]);
    const gscH = { Authorization: `Bearer ${gscToken}`, "Content-Type": "application/json" };

    async function gscQuery(body) {
      const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`,
        { method: "POST", headers: gscH, body: JSON.stringify(body) });
      return r.json();
    }

    // Overall
    const overall = await gscQuery({ startDate: launchDate, endDate: today, dimensions: [], dataState: "all" });
    const last7Data = await gscQuery({ startDate: last7, endDate: today, dimensions: [], dataState: "all" });

    console.log("\n📈 GOOGLE SEARCH CONSOLE");
    console.log("─".repeat(65));
    if (overall.rows?.[0]) {
      const r = overall.rows[0];
      console.log(`  Since Launch (${launchDate}):`);
      console.log(`  Clicks: ${r.clicks}  |  Impressions: ${r.impressions}  |  CTR: ${(r.ctr*100).toFixed(1)}%  |  Avg Pos: ${r.position.toFixed(1)}`);
    }
    if (last7Data.rows?.[0]) {
      const r = last7Data.rows[0];
      console.log(`\n  Last 7 Days:`);
      console.log(`  Clicks: ${r.clicks}  |  Impressions: ${r.impressions}  |  CTR: ${(r.ctr*100).toFixed(1)}%  |  Avg Pos: ${r.position.toFixed(1)}`);
    }

    // Top queries
    const queries = await gscQuery({ startDate: launchDate, endDate: today, dimensions: ["query"], rowLimit: 10, dataState: "all" });
    if (queries.rows?.length) {
      console.log("\n  Top Search Queries:");
      console.log(`  ${"Query".padEnd(40)} ${"Clicks".padEnd(8)} ${"Impr".padEnd(8)} Pos`);
      console.log("  " + "─".repeat(60));
      queries.rows.forEach(r => {
        console.log(`  ${truncate(r.keys[0], 40).padEnd(40)} ${String(r.clicks).padEnd(8)} ${String(r.impressions).padEnd(8)} ${r.position.toFixed(1)}`);
      });
    }

    // Top pages
    const pages = await gscQuery({ startDate: launchDate, endDate: today, dimensions: ["page"], rowLimit: 10, dataState: "all" });
    if (pages.rows?.length) {
      console.log("\n  Top Pages:");
      console.log(`  ${"Page".padEnd(45)} ${"Clicks".padEnd(7)} ${"Impr".padEnd(7)} Pos`);
      console.log("  " + "─".repeat(62));
      pages.rows.forEach(r => {
        const pg = truncate(r.keys[0].replace(BASE, "") || "/", 45);
        console.log(`  ${pg.padEnd(45)} ${String(r.clicks).padEnd(7)} ${String(r.impressions).padEnd(7)} ${r.position.toFixed(1)}`);
      });
    }

    // Index check for key pages
    const keyPages = ["/", "/products", "/dahisar-beauty-shop", "/reviews", "/about", "/faq", "/blog", "/categories/cosmetics"];
    console.log("\n  Index Status:");
    for (const pg of keyPages) {
      const res = await fetch("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
        method: "POST", headers: gscH,
        body: JSON.stringify({ inspectionUrl: BASE + pg, siteUrl: GSC_SITE })
      });
      const d = await res.json();
      const verdict = d.inspectionResult?.indexStatusResult?.verdict;
      const icon = verdict === "PASS" ? "✅" : verdict === "NEUTRAL" ? "⏳" : "❌";
      const state = d.inspectionResult?.indexStatusResult?.coverageState || "unknown";
      console.log(`  ${icon} ${pg.padEnd(35)} ${state}`);
    }

  } catch (e) {
    console.log("  ❌ GSC Error:", e.message);
  }

  // ── 2. GOOGLE ANALYTICS ────────────────────────────
  try {
    const gaToken = await getToken(["https://www.googleapis.com/auth/analytics.readonly"]);
    const gaH = { Authorization: `Bearer ${gaToken}`, "Content-Type": "application/json" };

    const gaRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/${GA_PROP}:runReport`, {
      method: "POST", headers: gaH,
      body: JSON.stringify({
        dateRanges: [{ startDate: launchDate, endDate: today }],
        metrics: [
          { name: "sessions" }, { name: "activeUsers" },
          { name: "bounceRate" }, { name: "averageSessionDuration" }, { name: "newUsers" }
        ]
      })
    });
    const gaData = await gaRes.json();

    // Traffic sources
    const sourcesRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/${GA_PROP}:runReport`, {
      method: "POST", headers: gaH,
      body: JSON.stringify({
        dateRanges: [{ startDate: launchDate, endDate: today }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }, { name: "bounceRate" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }]
      })
    });
    const sourcesData = await sourcesRes.json();

    console.log("\n\n📊 GOOGLE ANALYTICS");
    console.log("─".repeat(65));
    if (gaData.rows?.[0]) {
      const m = gaData.rows[0].metricValues;
      const totalSessions = parseInt(m[0].value);
      const bounce = (parseFloat(m[2].value) * 100).toFixed(0);
      const duration = Math.round(parseFloat(m[3].value));
      console.log(`  Sessions: ${totalSessions}  |  Users: ${m[1].value}  |  New: ${m[4].value}`);
      console.log(`  Bounce Rate: ${bounce}%  |  Avg Duration: ${duration}s`);
      console.log(`  Bounce ${bounce >= 70 ? "🔴 High (target <50%)" : bounce >= 50 ? "🟡 Medium (target <50%)" : "✅ Good"}`);
    }

    if (sourcesData.rows?.length) {
      console.log("\n  Traffic Sources:");
      sourcesData.rows.forEach(r => {
        const bounce = (parseFloat(r.metricValues[1].value) * 100).toFixed(0);
        console.log(`  ${r.dimensionValues[0].value.padEnd(25)} ${String(r.metricValues[0].value).padEnd(8)} sessions | ${bounce}% bounce`);
      });
    }

  } catch (e) {
    console.log("  ❌ GA Error:", e.message);
  }

  // ── 3. MERCHANT CENTER ─────────────────────────────
  try {
    const mcToken = await getToken(["https://www.googleapis.com/auth/content"]);
    const mcH = { Authorization: `Bearer ${mcToken}` };

    const statusRes = await fetch(
      `https://shoppingcontent.googleapis.com/content/v2.1/${MERCHANT}/productstatuses?maxResults=250`,
      { headers: mcH }
    );
    const statusData = await statusRes.json();
    const statuses = statusData.resources || [];

    let approved = 0, pending = 0, disapproved = 0;
    const issues = {};
    statuses.forEach(p => {
      const dests = p.destinationStatuses || [];
      if (dests.some(d => d.approvalStatus === "approved")) approved++;
      else if (dests.some(d => d.approvalStatus === "disapproved")) disapproved++;
      else pending++;
      (p.itemLevelIssues || []).forEach(i => {
        if (!issues[i.code]) issues[i.code] = { count: 0, desc: i.description };
        issues[i.code].count++;
      });
    });

    console.log("\n\n🛍  GOOGLE MERCHANT CENTER");
    console.log("─".repeat(65));
    console.log(`  Total Products: ${statuses.length}`);
    console.log(`  ✅ Approved:    ${approved}`);
    console.log(`  ⏳ Pending:     ${pending}`);
    console.log(`  ❌ Disapproved: ${disapproved}`);

    if (Object.keys(issues).length > 0) {
      console.log("\n  Top Issues:");
      Object.entries(issues)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5)
        .forEach(([code, info]) => {
          console.log(`  ${info.count.toString().padEnd(5)} ${truncate(info.desc, 55)}`);
        });
    }

  } catch (e) {
    console.log("  ❌ Merchant Error:", e.message);
  }

  console.log("\n" + "═".repeat(65));
  console.log("  Run again anytime: node scripts/seo-report.js");
  console.log("═".repeat(65) + "\n");
}

main().catch(err => console.error("❌ Fatal:", err.message));
