import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // All bots — allow all public pages, block admin/private routes
        userAgent: "*",
        allow: [
          "/",
          "/products/",
          "/categories/",
          "/blog/",
          "/about",
          "/contact",
          "/faq",
          "/dahisar-beauty-shop",
          "/occasions/",
          "/beauty-tips/",
          "/order",
          "/track-order",
          "/delivery",
          "/returns",
          "/how-to-order",
          "/llms.txt",
          "/feed.xml",
          "/reviews",
        ],
        disallow: [
          "/sabs-controller/",
          "/api/",
          "/favourites/",
          "/s/",
          "/wishlist",
          "/profile",
        ],
      },
      // ── Major AI crawlers — bring traffic via ChatGPT/Perplexity/Claude ──
      { userAgent: "GPTBot",         allow: "/" },
      { userAgent: "ChatGPT-User",   allow: "/" },
      { userAgent: "Google-Extended",allow: "/" },
      { userAgent: "CCBot",          allow: "/" },
      { userAgent: "anthropic-ai",   allow: "/" },
      { userAgent: "ClaudeBot",      allow: "/" },
      { userAgent: "PerplexityBot",  allow: "/" },
      { userAgent: "Applebot",       allow: "/" },
      { userAgent: "cohere-ai",      allow: "/" },

      // ── Block known spam/scraper bots that generate fake traffic ──────────
      // These contributed to the irrelevant US/EU traffic in Analytics
      { userAgent: "AhrefsBot",      disallow: "/" },
      { userAgent: "SemrushBot",     disallow: "/" },
      { userAgent: "MJ12bot",        disallow: "/" },
      { userAgent: "DotBot",         disallow: "/" },
      { userAgent: "BLEXBot",        disallow: "/" },
      { userAgent: "PetalBot",       disallow: "/" },
    ],
    sitemap: "https://www.shreeambikabeauty.com/sitemap.xml",
  };
}
