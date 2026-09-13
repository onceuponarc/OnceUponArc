import "server-only";

import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { SOLANA } from "@onceupon/config/solana";
import { serverSolanaRpcs } from "@/lib/solana/rpc-urls";

export { explorerAddress, explorerTx } from "@/lib/solana/explorer";

function makeConnection(rpc: string) {
  return new Connection(rpc, {
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

let connection: Connection | null = null;
let connectionUrl: string | null = null;

export function solanaConnection(): Connection {
  const url = serverSolanaRpcs()[0] ?? SOLANA.rpcUrl;
  if (!connection || connectionUrl !== url) {
    connection = makeConnection(url);
    connectionUrl = url;
  }
  return connection;
}

export function solanaConnections(): Connection[] {
  const urls = serverSolanaRpcs();
  return (urls.length ? urls : [SOLANA.rpcUrl]).map(makeConnection);
}

export function solToLamports(sol: number): bigint {
  return BigInt(Math.round(sol * LAMPORTS_PER_SOL));
}
