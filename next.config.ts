import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração para ignorar erros de TypeScript durante o build
  typescript: {
    ignoreBuildErrors: true,
  },
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