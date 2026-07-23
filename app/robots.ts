import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // All bots — allow public pages, block admin + API
        userAgent: "*",
        allow: ["/", "/products/", "/categories/", "/blog/", "/wishlist"],
        disallow: [
          "/sabs-controller/",
          "/api/",
          "/favourites/",
          "/s/",
        ],
      },
    ],
    sitemap: "https://www.shreeambikabeauty.com/sitemap.xml",
  };
}
