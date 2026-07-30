/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Image optimization ────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    // Only webp — avif doubles cache writes with minimal benefit
    // Cloudinary already serves avif/webp natively via f_auto
    formats: ["image/webp"],
    // 30 days cache — avoids re-optimization on repeat visits
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Fewer breakpoints = fewer cache entries per image
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
      // non-www → www
      {
        source: "/(.*)",
        has: [{ type: "host", value: "shreeambikabeauty.com" }],
        destination: "https://www.shreeambikabeauty.com/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
