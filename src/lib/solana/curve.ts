import { SOLANA } from "@onceupon/config/solana";

const LAMPORTS = 1_000_000_000n;

export function virtualQuoteLamports(): bigint {
  return BigInt(SOLANA.virtualQuoteSol) * LAMPORTS;
}

export function graduationLamports(): bigint {
  return BigInt(SOLANA.bondingGraduationSol) * LAMPORTS;
}

export function takeBps(amount: bigint, bps: number): bigint {
  if (amount <= 0n || bps <= 0) return 0n;
  return (amount * BigInt(bps)) / 10_000n;
}

/** Constant-product buy against virtual quote + real reserves. */
export function tokensOutForBuy(
  quoteReserve: bigint,
  tokenReserve: bigint,
  quoteIn: bigint,
): bigint {
  if (quoteIn <= 0n || tokenReserve <= 0n) return 0n;
  const x = quoteReserve + virtualQuoteLamports();
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
): bigint {
  if (tokensIn <= 0n || quoteReserve <= 0n) return 0n;
  const x = quoteReserve + virtualQuoteLamports();
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
