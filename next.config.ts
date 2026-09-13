import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino-pretty", "lokijs", "encoding", "@solana/web3.js", "bigint-buffer"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "pbs.twimg.com" },
      { protocol: "https", hostname: "abs.twimg.com" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "gateway.pinata.cloud" },
      { protocol: "https", hostname: "cloudflare-ipfs.com" },
      { protocol: "https", hostname: "*.ipfs.w3s.link" },
    ],
  },
  async redirects() {
    return [
      { source: "/press", destination: "/launch", permanent: false },
      { source: "/desk", destination: "/", permanent: false },
      { source: "/claims", destination: "/ledger", permanent: false },
      { source: "/trade", destination: "/wallet", permanent: false },
      { source: "/write", destination: "/launch", permanent: false },
      { source: "/bindings/link", destination: "/bindings", permanent: false },
    ];
  },
};

export default nextConfig;
