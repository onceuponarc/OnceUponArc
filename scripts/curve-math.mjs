function takeBps(amount, bps) {
  if (amount <= 0n || bps <= 0) return 0n;
  return (amount * BigInt(bps)) / 10_000n;
}

function tokensOutForBuy(quoteReserve, tokenReserve, quoteIn, virtualQuote) {
  const x = quoteReserve + virtualQuote;
  const k = x * tokenReserve;
  const newY = k / (x + quoteIn);
  return tokenReserve - newY;
}

function quoteOutForSell(quoteReserve, tokenReserve, tokensIn, virtualQuote) {
  const x = quoteReserve + virtualQuote;
  const k = x * tokenReserve;
  const newX = k / (tokenReserve + tokensIn);
  const out = x - newX;
  return out > quoteReserve ? quoteReserve : out;
}

function splitBuyFees(quoteIn, authorBps, protocolBps, snipeBps) {
  const snipe = takeBps(quoteIn, snipeBps);
  const rest = quoteIn - snipe;
  const protocol = takeBps(rest, protocolBps);
  const author = takeBps(rest, authorBps);
  return { snipe, protocol, author, toCurve: rest - protocol - author };
}

function chapterBuyBaseOut(virtualQuote, virtualBase, netIn, k) {
  const newQuote = virtualQuote + netIn;
  const newBase = k / newQuote;
  return virtualBase - newBase;
}

function chapterSellQuoteOutGross(virtualQuote, virtualBase, baseIn, k) {
  const newBase = virtualBase + baseIn;
  const newQuote = k / newBase;
  return virtualQuote - newQuote;
}

function virtualQuoteUiFor(startCapUi, virtualBaseUi, supplyUi) {
  return (startCapUi * virtualBaseUi) / supplyUi;
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const solVirtual = 30n * 1_000_000_000n;
const supply = 1_000_000_000n * 1_000_000n;
const buy = tokensOutForBuy(0n, supply, 1_000_000_000n, solVirtual);
assert(buy > 0n, "SOL buy should mint tokens");
const back = quoteOutForSell(1_000_000_000n, supply - buy, buy, solVirtual);
assert(back > 0n && back <= 1_000_000_000n, "SOL sell should return quote");

const usdcVirtual = 30_000n * 1_000_000n;
assert(tokensOutForBuy(0n, supply, 1_000_000_000n, usdcVirtual) > 0n, "USDC buy");
assert(tokensOutForBuy(0n, supply, 25_000_000n, 100n * 100_000_000n) > 0n, "xStock buy");

const fees = splitBuyFees(1_000_000n, 100, 20, 0);
assert(fees.toCurve + fees.author + fees.protocol === 1_000_000n, "fees must sum");

const startCap = 3_000;
const virtualBaseUi = 1_073_000_000;
const supplyUi = 1_000_000_000;
const virtualQuoteUi = virtualQuoteUiFor(startCap, virtualBaseUi, supplyUi);
assert(Math.abs(virtualQuoteUi - 3_219) < 0.0001, `start cap should imply ~3219 virtual USDC, got ${virtualQuoteUi}`);
assert(supplyUi * 0.2 === 200_000_000, "20% LP reserve");
assert(supplyUi * 0.8 === 800_000_000, "80% tradable");

const vq = 3_219n * 1_000_000n;
const vb = 1_073_000_000n * 1_000_000n;
const k = vq * vb;
const netIn = 10n * 1_000_000n;
const baseOut = chapterBuyBaseOut(vq, vb, netIn, k);
assert(baseOut > 0n, "Chapter buy must return base");
const vq2 = vq + netIn;
const vb2 = k / vq2;
assert(vq2 * vb2 <= k, "k floor after buy");
assert(k - vq2 * vb2 < vq2, "k shortfall bounded by grown virtual quote");

const sold = baseOut / 2n;
const gross = chapterSellQuoteOutGross(vq2, vb2, sold, k);
assert(gross > 0n && gross <= netIn, "Chapter sell cannot pay more than real quote in this fixture");
const vb3 = vb2 + sold;
const vq3 = k / vb3;
assert(vq3 * vb3 <= k, "k floor after sell");

console.log(
  JSON.stringify({
    ok: true,
    solBuy: buy.toString(),
    sellBack: back.toString(),
    virtualQuoteUi,
    chapterBuy: baseOut.toString(),
    chapterSell: gross.toString(),
  }),
);
