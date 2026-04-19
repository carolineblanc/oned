import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['swisseph'],
  cacheComponents: true,
  cacheLife: {
    transits: {
      stale: 60,
      revalidate: 4 * 3600,
      expire: 4 * 3600,
    },
    interpretations: {
      stale: 60,
      revalidate: 12 * 3600,
      expire: 12 * 3600,
    },
  },
};

export default nextConfig;
