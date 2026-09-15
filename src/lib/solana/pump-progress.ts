import "server-only";

// pump.fun bonding curves start with this many raw base units of real token
// reserves and deplete toward zero as buys land; graduation flips `complete`.
// This is the standard constant across pump.fun's bonding curve (793.1M
// tokens at 6 decimals) — not something that varies per token.
const INITIAL_REAL_TOKEN_RESERVES = 793_100_000_000_000;

export type BondingProgress = { progressBps: number; graduated: boolean };

const cache = new Map<string, { value: BondingProgress; ts: number }>();
const TTL_MS = 30_000;

export async function getPumpBondingProgress(mint: string): Promise<BondingProgress | null> {
  const cached = cache.get(mint);
  if (cached && Date.now() - cached.ts < TTL_MS) return cached.value;
  try {
    const res = await fetch(`https://frontend-api-v3.pump.fun/coins/${mint}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { complete?: boolean; real_token_reserves?: number };
    if (data.complete) {
      const value = { progressBps: 10_000, graduated: true };
      cache.set(mint, { value, ts: Date.now() });
      return value;
    }
    if (typeof data.real_token_reserves !== "number") return null;
    const fraction = 1 - data.real_token_reserves / INITIAL_REAL_TOKEN_RESERVES;
    const value = { progressBps: Math.round(Math.max(0, Math.min(1, fraction)) * 10_000), graduated: false };
    cache.set(mint, { value, ts: Date.now() });
    return value;
  } catch {
    return null;
  }
}
