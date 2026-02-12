import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PWA-ready image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
