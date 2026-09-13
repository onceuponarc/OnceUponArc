import { SOLANA } from "@onceupon/config/solana";

export const MAX_SUPPLY_UI = 1_000_000_000_000;
export const MIN_SUPPLY_UI = 1;

export function clampDecimals(value: number | undefined, nft: boolean) {
  if (nft) return SOLANA.nftDecimals;
  if (!Number.isFinite(value)) return SOLANA.defaultDecimals;
  return Math.min(9, Math.max(0, Math.floor(Number(value))));
}

export function clampSupplyUi(value: number | undefined, nft: boolean, nftSupply: number) {
  if (nft) return Math.max(1, Math.min(Math.floor(nftSupply || 1), 10_000));
  if (!Number.isFinite(value)) return SOLANA.defaultSupply;
  return Math.min(MAX_SUPPLY_UI, Math.max(MIN_SUPPLY_UI, Math.floor(Number(value))));
}

export function clampPositiveUi(value: number | undefined, fallback: number) {
  if (!Number.isFinite(value) || Number(value) <= 0) return fallback;
  return Number(value);
}

export function startingPriceUi(virtualQuoteUi: number, supplyUi: number) {
  if (!supplyUi) return 0;
  return virtualQuoteUi / supplyUi;
}

/** Holder claim share of a manually funded vault, proportional to circulating holdings. */
export function holderClaimShare(opts: {
  reward: bigint;
  held: bigint;
  supply: bigint;
  curveTokens: bigint;
}): bigint {
  if (opts.reward <= 0n || opts.held <= 0n || opts.supply <= 0n) return 0n;
  const circulating = opts.supply > opts.curveTokens ? opts.supply - opts.curveTokens : 0n;
  if (circulating <= 0n || opts.held > circulating) return 0n;
  return (opts.reward * opts.held) / circulating;
}

export function rewardModeForEngine(engine: "author" | "onceuponers") {
  return engine === "author" ? ("creator_stream" as const) : ("holder_claim" as const);
}
