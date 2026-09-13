import "server-only";

import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SOLANA } from "@onceupon/config/solana";

export { explorerAddress, explorerTx } from "@/lib/solana/explorer";

let connection: Connection | null = null;

export function solanaConnection(): Connection {
  if (!connection) {
    const rpc = process.env.SOLANA_RPC_URL ?? process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? SOLANA.rpcUrl;
    connection = new Connection(rpc, {
      commitment: "confirmed",
      disableRetryOnRateLimit: true,
      fetch: (url, options) => {
        const timeout = AbortSignal.timeout(12_000);
        const parent = options?.signal;
        const signal = parent ? AbortSignal.any([parent, timeout]) : timeout;
        return fetch(url, { ...options, signal });
      },
    });
  }
  return connection;
}

export function solToLamports(sol: number): bigint {
  return BigInt(Math.round(sol * LAMPORTS_PER_SOL));
}
