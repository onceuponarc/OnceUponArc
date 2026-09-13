import type { NextConfig } from "next";

const bigintBufferStub = "./src/lib/solana/bigint-buffer-stub.cjs";

const nextConfig: NextConfig = {
  // Do not externalize @solana/web3.js — Vercel cannot load its native bigint-buffer addon.
  serverExternalPackages: ["pino-pretty", "lokijs", "encoding"],
  turbopack: {
    resolveAlias: {
      "bigint-buffer": bigintBufferStub,
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "bigint-buffer": bigintBufferStub,
    };
    return config;
  },
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
      { source: "/press", destination: "/launch/arc", permanent: false },
      { source: "/desk", destination: "/", permanent: false },
      { source: "/claims", destination: "/ledger", permanent: false },
      { source: "/trade", destination: "/wallet", permanent: false },
      { source: "/write", destination: "/launch/arc", permanent: false },
      { source: "/bindings/link", destination: "/bindings", permanent: false },
      { source: "/launch/solana", destination: "/launch/arc", permanent: false },
      { source: "/launch/robinhood", destination: "/launch/arc", permanent: false },
      { source: "/launch/rh", destination: "/launch/arc", permanent: false },
    ];
  },
};

export default nextConfig;
