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

console.log(JSON.stringify({ ok: true, solBuy: buy.toString(), sellBack: back.toString() }));
