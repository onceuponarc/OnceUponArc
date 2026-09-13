export function takeBps(amount: bigint, bps: number): bigint {
  if (amount <= 0n || bps <= 0) return 0n;
  return (amount * BigInt(bps)) / 10_000n;
}

export const MAX_CURVE_FEE_BPS = 400;

/** Constant-product buy against virtual quote + real reserves (legacy Stories). */
export function tokensOutForBuy(
  quoteReserve: bigint,
  tokenReserve: bigint,
  quoteIn: bigint,
  virtualQuote: bigint,
): bigint {
  if (quoteIn <= 0n || tokenReserve <= 0n) return 0n;
  const x = quoteReserve + virtualQuote;
  const k = x * tokenReserve;
  const newX = x + quoteIn;
  const newY = k / newX;
  const out = tokenReserve - newY;
  return out > 0n ? out : 0n;
}

export function quoteOutForSell(
  quoteReserve: bigint,
  tokenReserve: bigint,
  tokensIn: bigint,
  virtualQuote: bigint,
): bigint {
  if (tokensIn <= 0n || quoteReserve <= 0n) return 0n;
  const x = quoteReserve + virtualQuote;
  const k = x * tokenReserve;
  const newY = tokenReserve + tokensIn;
  const newX = k / newY;
  const out = x - newX;
  if (out <= 0n) return 0n;
  return out > quoteReserve ? quoteReserve : out;
}

export function splitBuyFees(quoteIn: bigint, authorBps: number, protocolBps: number, snipeBps: number) {
  const snipe = takeBps(quoteIn, snipeBps);
  const rest = quoteIn - snipe;
  const protocol = takeBps(rest, protocolBps);
  const author = takeBps(rest, authorBps);
  const toCurve = rest - protocol - author;
  return { snipe, protocol, author, toCurve };
}

export type ChapterState = {
  virtualQuote: bigint;
  virtualBase: bigint;
  realQuote: bigint;
  realBase: bigint;
  lpReserved: bigint;
  k: bigint;
  graduateTarget: bigint;
};

export function isChapterCurve(virtualBase: bigint | null | undefined): virtualBase is bigint {
  return virtualBase != null && virtualBase > 0n;
}

/** Spec: baseOut from net quote in. Integer path floors the create-time k. */
export function chapterBuyBaseOut(
  virtualQuote: bigint,
  virtualBase: bigint,
  netIn: bigint,
  k: bigint = virtualQuote * virtualBase,
): bigint {
  if (netIn <= 0n || virtualQuote <= 0n || virtualBase <= 0n || k <= 0n) return 0n;
  const newQuote = virtualQuote + netIn;
  const newBase = k / newQuote;
  if (newBase >= virtualBase) return 0n;
  return virtualBase - newBase;
}

/** Spec: gross quote out from base in. Integer path floors the create-time k. */
export function chapterSellQuoteOutGross(
  virtualQuote: bigint,
  virtualBase: bigint,
  baseIn: bigint,
  k: bigint = virtualQuote * virtualBase,
): bigint {
  if (baseIn <= 0n || virtualQuote <= 0n || virtualBase <= 0n || k <= 0n) return 0n;
  const newBase = virtualBase + baseIn;
  const newQuote = k / newBase;
  if (newQuote >= virtualQuote) return 0n;
  return virtualQuote - newQuote;
}

export function splitCurveFee(fee: bigint, authorBps: number, protocolBps: number, pieceBps = 0) {
  const total = authorBps + protocolBps + pieceBps;
  if (fee <= 0n || total <= 0) return { author: 0n, protocol: 0n, piece: 0n };
  const author = (fee * BigInt(authorBps)) / BigInt(total);
  const protocol = (fee * BigInt(protocolBps)) / BigInt(total);
  const piece = fee - author - protocol;
  return { author, protocol, piece };
}

export function chapterFeeBps(authorBps: number, protocolBps: number, pieceBps = 0) {
  const sum = Math.max(0, authorBps) + Math.max(0, protocolBps) + Math.max(0, pieceBps);
  return Math.min(MAX_CURVE_FEE_BPS, sum);
}

export function quoteChapterBuy(state: ChapterState, quoteIn: bigint, feeBps: number) {
  const bps = Math.min(MAX_CURVE_FEE_BPS, Math.max(0, feeBps));
  const fee = takeBps(quoteIn, bps);
  const netIn = quoteIn - fee;
  const baseOut = chapterBuyBaseOut(state.virtualQuote, state.virtualBase, netIn, state.k);
  const remaining = state.realBase > baseOut ? state.realBase - baseOut : 0n;
  const nextRealQuote = state.realQuote + netIn;
  const crosses = state.graduateTarget > 0n && nextRealQuote >= state.graduateTarget;
  const wouldEatLp = remaining < state.lpReserved && !crosses;
  return { fee, netIn, baseOut, remaining, nextRealQuote, crosses, wouldEatLp };
}

export function quoteChapterSell(state: ChapterState, baseIn: bigint, feeBps: number) {
  const bps = Math.min(MAX_CURVE_FEE_BPS, Math.max(0, feeBps));
  const gross = chapterSellQuoteOutGross(state.virtualQuote, state.virtualBase, baseIn, state.k);
  const fee = takeBps(gross, bps);
  const quoteOut = gross > fee ? gross - fee : 0n;
  const vaultDry = gross > state.realQuote;
  return { gross, fee, quoteOut, vaultDry };
}
