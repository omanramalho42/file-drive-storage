import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fastidious-capybara-251.convex.cloud",
      },
    ],
  },
};

export default nextConfig;