/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent trailing slash duplicates — /categories/ → /categories
  trailingSlash: false,

  // ── Image optimization ────────────────────────────────────────────────────
  // STRATEGY: Bypass Vercel image optimizer for Cloudinary images.
  // Cloudinary already serves WebP/AVIF via f_auto,q_auto in the URL.
  // Running Vercel optimizer ON TOP wastes cache writes (91K/100K on free plan).
  // We use unoptimized:true and handle optimization at Cloudinary URL level instead.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    // Disable Vercel's optimizer — Cloudinary handles optimization natively
    // This saves 100K cache writes/month on the free plan
    unoptimized: true,
    // Keep these for any non-Cloudinary images that may exist
    formats: ["image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [640, 828, 1200],
    imageSizes: [48, 96, 256],
  },

  // ── Compiler optimizations ────────────────────────────────────────────────
  compiler: {
    // Remove console.log in production (reduces bundle size)
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // ── Experimental performance features ────────────────────────────────────
  experimental: {
    // Optimize package imports (tree-shaking for icon libraries)
    optimizePackageImports: [
      "react-icons",
      "react-icons/fi",
      "react-icons/fa",
      "react-icons/md",
      "react-icons/hi",
    ],
  },

  // ── Headers for caching & security ───────────────────────────────────────
  async headers() {
    return [
      // Static assets — long cache
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      // Feed — cache 1 hour
      {
        source: "/feed.xml",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400" },
        ],
      },
      // API routes — no cache
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
      // Public pages — short cache with revalidation
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Allow opening in real browser from Facebook/Instagram in-app browser
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Geo-targeting hint — tells CDN/proxies this content is for India
          { key: "Content-Language", value: "en-IN" },
          { key: "X-Target-Country", value: "IN" },
        ],
      },
    ];
  },

  // ── Redirects ─────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // HTTP → HTTPS (non-www)
      {
        source: "/(.*)",
        has: [{ type: "header", key: "x-forwarded-proto", value: "http" }],
        destination: "https://www.shreeambikabeauty.com/:path*",
        permanent: true,
      },
      // non-www → www (HTTP)
      {
        source: "/(.*)",
        has: [{ type: "host", value: "shreeambikabeauty.com" }],
        destination: "https://www.shreeambikabeauty.com/:path*",
        permanent: true,
      },
      // non-www HTTPS → www HTTPS (belt + suspenders)
      {
        source: "/(.*)",
        has: [
          { type: "host", value: "shreeambikabeauty.com" },
          { type: "header", key: "x-forwarded-proto", value: "https" },
        ],
        destination: "https://www.shreeambikabeauty.com/:path*",
        permanent: true,
      },
      // Trailing slash removal — prevents duplicate content /categories/ vs /categories
      {
        source: "/:path+/",
        destination: "/:path+",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
