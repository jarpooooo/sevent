import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  // Kompres respons dan jangan umumkan framework di header
  compress: true,
  poweredByHeader: false,
  images: {
    // AVIF lebih kecil dari WebP; Next menyajikan format terbaik yang didukung browser dan menyimpannya di cache
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
