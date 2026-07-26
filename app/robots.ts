import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // All bots — allow public pages, block admin
        userAgent: "*",
        allow: ["/", "/products/", "/categories/", "/blog/", "/wishlist", "/about", "/contact", "/faq", "/dahisar-beauty-shop", "/occasions/", "/beauty-tips/", "/order", "/track-order", "/delivery", "/returns", "/how-to-order", "/profile", "/llms.txt"],
        disallow: [
          "/sabs-controller/",
          "/api/",
          "/favourites/",
          "/s/",
        ],
      },
      // Explicitly allow major AI crawlers — they bring traffic via ChatGPT/Perplexity referrals
      { userAgent: "GPTBot",              allow: "/" },
      { userAgent: "ChatGPT-User",        allow: "/" },
      { userAgent: "Google-Extended",     allow: "/" },
      { userAgent: "CCBot",               allow: "/" },
      { userAgent: "anthropic-ai",        allow: "/" },
      { userAgent: "ClaudeBot",           allow: "/" },
      { userAgent: "PerplexityBot",       allow: "/" },
      { userAgent: "Applebot",            allow: "/" },
      { userAgent: "cohere-ai",           allow: "/" },
    ],
    sitemap: "https://www.shreeambikabeauty.com/sitemap.xml",
  };
}
