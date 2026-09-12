import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["thirdweb"],
  serverExternalPackages: ["pino-pretty", "lokijs", "encoding"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "abs.twimg.com" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "*.thirdweb.com" },
      { protocol: "https", hostname: "*.thirdweb-cdn.com" },
    ],
  },
};

export default nextConfig;
