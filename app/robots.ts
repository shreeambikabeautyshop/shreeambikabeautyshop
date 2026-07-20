import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/sabs-controller/",
          "/api/admin/",
          "/api/admin/verify-pin",
          "/api/admin/logout",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/sabs-controller/", "/api/admin/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/sabs-controller/", "/api/admin/"],
      },
    ],
    sitemap: "https://shreeambikabeautyshop.vercel.app/sitemap.xml",
    host: "https://shreeambikabeautyshop.vercel.app",
  };
}
