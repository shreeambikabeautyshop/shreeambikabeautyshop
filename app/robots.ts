import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/sabs-controller/", "/api/"],
      },
    ],
    sitemap: "https://shreeambikabeautyshop.vercel.app/sitemap.xml",
  };
}
