import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
  // Limit request body size to prevent memory exhaustion from large uploads
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
