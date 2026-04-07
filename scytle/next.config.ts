import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // tailwindcss needs native fs access for __unstable__loadDesignSystem
  serverExternalPackages: ['tailwindcss'],
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;
