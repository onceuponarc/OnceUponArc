/** Canonical OnceUpon copy. Keep this file free of forbidden offering language. */

export const POSITIONING =
  "OnceUpon is a token launchpad centered on Arc, with every other chain open. Launch on Arc, Solana, Ethereum, Base, or Robinhood Chain. Tokens print on Solana mainnet so they are live immediately against deep pairs — SOL, Bitcoin (cbBTC), Ether, stables, listed tokenized stocks, memes, or any mint. You pick the live DEX pool at launch. You do not fund an empty pool. Other chains tag the Story and bind a destination-chain pool. Authors launch original Stories. Fees either stream to the Author each trade, or stream into an ownerless vault that holders can claim as The Piece. Pairing against a tokenized name is a quote, not studio equity. OnceUpon does not issue studio equity and does not sell shares in NVIDIA, Disney, or anyone else.";

export const TAGLINE = "OnceUponers write the stories. The chain keeps the receipts.";

export const PAD_TAGLINE = "Launch on Arc. Pair any chain. Print into real liquidity.";

export const MODE_COPY = {
  author: {
    title: "Author",
    headline: "Keep the pen",
    body: "Fees land in your wallet on every trade.",
  },
  onceuponers: {
    title: "OnceUponers",
    headline: "Share the book",
    body: "Fees land in a vault no one owns. Holders claim The Piece.",
  },
} as const;

export const LAUNCH_TYPES = [
  {
    id: "author" as const,
    title: "Author",
    headline: "Keep the pen",
    badge: "0–3.00% author fee",
    summary: "Fees land in your wallet on every trade.",
    how: [
      "Pick an author fee from 0% to 3.00%. The choice is locked when you launch.",
      "Every swap pushes that cut to your connected Solana wallet in the same transaction. No claim button.",
      "Protocol takes about 0.20% on top. That cut is not yours to set.",
      "Same engine on every open chain including Arc. The mint lands on Solana mainnet today against the pair and live DEX pool you pick.",
    ],
  },
  {
    id: "onceuponers" as const,
    title: "OnceUponers",
    headline: "Share the book",
    badge: "Author cap 1.00%",
    summary: "Fees land in a vault no one owns. Holders claim The Piece.",
    how: [
      "Author fee caps at 1.00%. That cut sits in an ownerless vault.",
      "Turn on auto-buy and the vault converts each cut into the pair you chose, then holders claim The Piece.",
      "The Piece is a protocol fee split among current holders — not a dividend, not profit-sharing.",
      "Selling before you claim forfeits unsaved accumulator. The vault has no owner to chase.",
    ],
  },
  {
    id: "rwa" as const,
    title: "Tokenized RWA / single-name",
    headline: "Pair against listed mints",
    badge: "Listed quotes",
    summary:
      "Launch against SOL, stables, listed tokenized stocks, treasuries, or paste any mint. That is a quote pair, not studio equity.",
    how: [
      "A Story can pair against a listed tokenized asset. That is a quote pair, not studio equity.",
      "Pick USDC, a listed xStock, USDY/OUSG, or paste any mint. Buys and sells settle in that mint.",
      "Pairing against a tokenized mint is not a claim on the issuer and it is not studio equity.",
    ],
  },
] as const;

export const PAIR_TYPES = [
  {
    id: "sol" as const,
    label: "SOL",
    listed: true,
    body: "Native Solana depth. Bonding, Pump-style, and Pons-style launches all clear in SOL on mainnet.",
  },
  {
    id: "btc" as const,
    label: "BTC / ETH",
    listed: true,
    body: "Pair into cbBTC and Portal wETH already on Solana. No empty pool to fund.",
  },
  {
    id: "meme" as const,
    label: "Memes + any mint",
    listed: true,
    body: "BONK, WIF, JUP, PENGU, or paste any SPL mint — another chain’s wrap, a meme, anything on-chain.",
  },
  {
    id: "rwa" as const,
    label: "Stocks / treasuries",
    listed: true,
    body: "Listed xStocks, Ondo USDY/OUSG, or paste any mint. Quote pair only — not studio equity and not a claim on the issuer.",
  },
] as const;

export const BONDING_COPY =
  "Launches open on a bonding curve against the pair you pick. SOL pairs bond at 2 SOL. Stables bond at 5,000 units. cbBTC bonds at 0.1. Listed xStocks bond at 10 of the quote mint. You pair into liquidity that already exists — you do not fund an empty pool. The Raydium, Orca, PumpSwap, Uniswap, or Pons pool you pick is bound on the Story from the first block.";

export const PIECE_EXPLAINER =
  "The Piece is a protocol fee split among current holders of a Story. It is not a dividend, not profit-sharing, and not a return on investment.";

export const AUTHOR_FEE_EXPLAINER =
  "Author fees are a configurable swap fee, pushed on the same transaction as the trade.";

export const RIGHTS_TICK =
  "I have the rights to this art and name. This Story is original work. It is not licensed studio merchandise and it is not a claim on any issuer.";

export const MARGIN_DISCLAIMER =
  "The Margin is a doorway to Jupiter. OnceUpon does not custody margin, does not run a matching engine, and does not set your leverage. Longs and shorts live on Jupiter’s accounts.";

export const QUOTE_DISCLAIMER =
  "You pair into liquidity that already exists — SOL, Bitcoin (cbBTC), Ether, stables, listed stocks, memes, or any mint. Pick the live DEX pool at launch. You do not fund an empty pool. Pairing against a tokenized mint is a quote, not studio equity.";

export const RWA_GATE =
  "Pick a listed quote mint, or paste any Solana mint. A gated name is not a waitlist for shares.";

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
