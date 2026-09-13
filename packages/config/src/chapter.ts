/** Chapter Curve defaults. Shared by Arc contracts (comments) and the Solana mirror. */

export const CHAPTER = {
  /** Display supply minted into the base vault at create. */
  totalSupplyUi: 1_000_000_000,
  /** Pump-class virtual base (display tokens). Makes the first buy cheap, not free. */
  virtualBaseUi: 1_073_000_000,
  /** Fraction of supply sold on the curve. Remainder is lpBaseReserved. */
  tradableBps: 8_000,
  lpReservedBps: 2_000,
  /** Starting cap target in quote display units (retune virtualQuote per asset). */
  startCapQuoteUi: 3_000,
  /** Default graduation target in quote display units for stables. */
  graduateQuoteUi: 5_000,
  maxCurveFeeBps: 400,
  protocolBpsDefault: 20,
} as const;

/** virtualQuote such that start cap ≈ startCapQuoteUi · P0 = virtualQuote / virtualBase. */
export function virtualQuoteUiFor(opts?: { startCapUi?: number; virtualBaseUi?: number; supplyUi?: number }) {
  const startCap = opts?.startCapUi ?? CHAPTER.startCapQuoteUi;
  const virtualBase = opts?.virtualBaseUi ?? CHAPTER.virtualBaseUi;
  const supply = opts?.supplyUi ?? CHAPTER.totalSupplyUi;
  if (supply <= 0) return startCap;
  return (startCap * virtualBase) / supply;
}

/** Keep virtualBase / supply = 1.073 when the author changes supply. */
export function virtualBaseUiFor(supplyUi: number = CHAPTER.totalSupplyUi) {
  if (supplyUi <= 0) return CHAPTER.virtualBaseUi;
  return (supplyUi * CHAPTER.virtualBaseUi) / CHAPTER.totalSupplyUi;
}

export function lpBaseReservedUi(supplyUi: number = CHAPTER.totalSupplyUi) {
  return (supplyUi * CHAPTER.lpReservedBps) / 10_000;
}

export function tradableUi(supplyUi: number = CHAPTER.totalSupplyUi) {
  return (supplyUi * CHAPTER.tradableBps) / 10_000;
}

export function chapterStartPriceUi(virtualQuoteUi: number, virtualBaseUi: number) {
  if (!virtualBaseUi) return 0;
  return virtualQuoteUi / virtualBaseUi;
}
