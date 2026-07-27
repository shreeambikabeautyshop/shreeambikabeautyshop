/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Image optimization ────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    // Cloudinary handles its own optimization — skip Next.js re-encoding
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache for images
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
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
