import "server-only";

import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, getMint } from "@solana/spl-token";
import { solanaConnection } from "@/lib/solana/connection";

const cache = new Map<string, { decimals: number; programId: PublicKey; ts: number }>();
const TTL_MS = 5 * 60_000;

/** Resolves a mint's real decimals + owning token program directly on-chain —
 *  never trust a client-supplied decimals value for converting a UI amount
 *  into raw units, since that number determines how much actually gets spent. */
export async function getMintInfo(mint: string): Promise<{ decimals: number; programId: PublicKey }> {
  const cached = cache.get(mint);
  if (cached && Date.now() - cached.ts < TTL_MS) return cached;
  const pubkey = new PublicKey(mint);
  const conn = solanaConnection();
  try {
    const info = await getMint(conn, pubkey, "confirmed", TOKEN_PROGRAM_ID);
    const result = { decimals: info.decimals, programId: TOKEN_PROGRAM_ID, ts: Date.now() };
    cache.set(mint, result);
    return result;
  } catch {
    const info = await getMint(conn, pubkey, "confirmed", TOKEN_2022_PROGRAM_ID);
    const result = { decimals: info.decimals, programId: TOKEN_2022_PROGRAM_ID, ts: Date.now() };
    cache.set(mint, result);
    return result;
  }
}
