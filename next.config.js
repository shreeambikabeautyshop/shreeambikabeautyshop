/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    return [
      // /feed.xml → /api/feed (Google Merchant Center product feed)
      {
        source: '/feed.xml',
        destination: '/api/feed',
      },
    ];
  },
};

module.exports = nextConfig;
