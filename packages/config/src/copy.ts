/** Canonical OnceUpon copy. Keep this file free of forbidden offering language. */

export const POSITIONING =
  "OnceUpon is a social token launchpad on Arc. Launch on Arc (native Chapter Curve), Solana (SPL Chapter Curve), or Robinhood Chain (Pons hop-1). Arc Chapters are tradable the instant create lands — buyers pay USDC, the vault holds it. The Author does not seed an AMM at print. Graduation opens the book from those vault reserves. Solana prints a full SPL mint on the same curve math. Robinhood Chain tags the Story and binds a Pons pool as hop-1 routing. Binding an existing quote market (including NVDAx/USDC) is hop-1 routing depth, not the Story pool. Authors launch original Stories. Fees either stream to the Author each trade, or stream into an ownerless vault that holders can claim as The Piece. Pairing against a tokenized name is a quote, not studio equity. OnceUpon does not issue studio equity and does not sell shares in NVIDIA, Disney, or anyone else.";

export const TAGLINE = "OnceUponers write the stories. The chain keeps the receipts.";

export const PAD_TAGLINE = "Open the Chapter. Buyers write the book.";

export const MODE_COPY = {
  author: {
    title: "Creator fees",
    headline: "Paid on every trade",
    body: "Your cut lands in your connected wallet on every buy and sell. No claim button.",
  },
  onceuponers: {
    title: "Holder claims",
    headline: "You fund the pool",
    body: "Trades do not skim a creator cut. You deposit rewards. Holders claim a share proportional to what they hold.",
  },
} as const;

export const LAUNCH_TYPES = [
  {
    id: "author" as const,
    title: "Creator fees",
    headline: "Paid on every trade",
    badge: "0–3.00% creator fee",
    summary: "Your cut is pushed to your Solana wallet in the same transaction as the swap.",
    how: [
      "Pick a creator fee from 0% to 3.00%. The choice is locked when you launch.",
      "Every buy and sell pushes that cut to your connected Solana wallet in the same transaction. No claim button.",
      "Protocol takes 0.20% on top. That cut is not yours to set. Curve fees cap at 4.00%.",
      "This is a full SPL mint on a Chapter Curve. Pair against a stock, ETF, treasury, bond, SOL, or any quote. You do not deposit inventory.",
    ],
  },
  {
    id: "onceuponers" as const,
    title: "Holder claims",
    headline: "You fund the pool",
    badge: "Manual deposits",
    summary:
      "Holders claim a share of a rewards pool you deposit. That is not a dividend and not a return on investment.",
    how: [
      "Trades take only the 0.20% protocol cut. There is no automatic creator skim.",
      "You deposit quote tokens or SOL into the Story vault when you choose.",
      "Holders claim in proportion to their current holding versus circulating supply.",
      "Selling before you claim forfeits unsaved share. The Piece is a protocol split — not a dividend.",
    ],
  },
  {
    id: "rwa" as const,
    title: "Tokenized RWA / single-name",
    headline: "Pair against listed mints",
    badge: "Listed quotes",
    summary:
      "Launch against SOL, stables, listed tokenized stocks, ETFs, treasuries, bonds, or paste any mint. That is a quote pair, not studio equity.",
    how: [
      "A Story can pair against a listed tokenized asset. That is a quote pair, not studio equity.",
      "Pick USDC, a listed xStock or ETF, USDY/OUSG, or paste any mint. Buys and sells settle in that mint.",
      "Pairing against a tokenized mint is not a claim on the issuer and it is not studio equity. An existing NVDAx/USDC book is hop-1 routing, never this Story’s pool.",
    ],
  },
] as const;

export const PAIR_TYPES = [
  {
    id: "sol" as const,
    label: "SOL",
    listed: true,
    body: "Native Solana depth. SPL launches clear in SOL on the Chapter Curve. Existing SOL/USDC pools are hop-1 routing.",
  },
  {
    id: "btc" as const,
    label: "BTC / ETH",
    listed: true,
    body: "Pair into cbBTC and Portal wETH already on Solana. No empty pool to fund.",
  },
  {
    id: "meme" as const,
    label: "Memes + any pool",
    listed: true,
    body: "BONK, WIF, JUP, PENGU, or paste any SPL mint and any pool address.",
  },
  {
    id: "rwa" as const,
    label: "Stocks / ETFs / bonds",
    listed: true,
    body: "Listed xStocks, SPYx/QQQx, Ondo USDY/OUSG, or paste any mint. Quote pair only — not studio equity.",
  },
] as const;

export const BONDING_COPY =
  "SPL launches open a Chapter Curve the instant create lands. You set supply, decimals, start cap, and graduate target. USDC Chapters default to a ~$3,000 start cap and a $5,000 graduate target. 80% of supply trades on the curve; 20% is reserved for the book at graduation. Buyers pay quote into the vault — the Author does not seed an AMM at print. DexScreener and Jupiter see LP when the Chapter graduates and the vault opens the book. Binding an existing NVDAx/USDC or SOL/USDC pool tags hop-1 routing depth; it does not put your mint in that LP. Pairing against a tokenized mint is a quote, not studio equity.";

export const PIECE_EXPLAINER =
  "Holder claims pay a share of a rewards pool the author deposits. The share is proportional to current holdings. It is not a dividend, not profit-sharing, and not a return on investment.";

export const AUTHOR_FEE_EXPLAINER =
  "Author fees are a configurable swap fee, pushed on the same transaction as the trade.";

export const RIGHTS_TICK =
  "I have the rights to this art and name. This Story is original work. It is not licensed studio merchandise and it is not a claim on any issuer.";

export const MARGIN_DISCLAIMER =
  "The Margin is a doorway to Jupiter. OnceUpon does not custody margin, does not run a matching engine, and does not set your leverage. Longs and shorts live on Jupiter’s accounts.";

export const QUOTE_DISCLAIMER =
  "You launch against SOL, Bitcoin (cbBTC), Ether, stables, listed stocks, ETFs, treasuries, bonds, memes, or any mint. Your USDC (or other quote) stays in the book until graduation. Binding an existing quote market is hop-1 routing, not a deposit. Pairing against a tokenized mint is a quote, not studio equity.";

export const RWA_GATE =
  "Pick a listed quote mint, or paste any Solana mint. A gated name is not a waitlist for shares.";

export const CHAPTER_BUYER_NOTE = "Your USDC stays in the book until graduation.";

export function humanizeJupiterQuoteError(raw: { error?: unknown; errorCode?: unknown }): string {
  const code = String(raw.errorCode ?? "");
  const message = typeof raw.error === "string" ? raw.error : "";
  if (code === "TOKEN_NOT_TRADABLE" || /not tradable/i.test(message)) {
    return "Jupiter has no pool for this mint yet. Buy and sell on the Chapter Curve until graduation. A tagged quote book is hop-1 routing, not this Story’s market.";
  }
  return message || "Jupiter returned no route.";
}

export const FORBIDDEN_PHRASES = [
  "Disney shares",
  "official NVIDIA stock",
  "guaranteed yield",
] as const;

export function feeExample(buyUsdc: number, authorBps: number): string {
  const sent = (buyUsdc * authorBps) / 10_000;
  const pct = (authorBps / 100).toFixed(2);
  return `A ${buyUsdc.toLocaleString("en-US")} USDC buy at ${pct}% sends ${sent.toLocaleString(
    "en-US",
  )} USDC to the Author before the pool fee.`;
}
