import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Puppeteer needs to be excluded from webpack bundling
  experimental: {
    serverComponentsExternalPackages: ["puppeteer", "puppeteer-core", "bcryptjs"],
  },
};

export default nextConfig;
