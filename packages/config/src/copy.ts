/** Canonical OnceUpon copy. Keep this file free of forbidden offering language. */

export const POSITIONING =
  "OnceUpon is a token launchpad. Solana is live on devnet. Circle Arc and Robinhood Chain (Pons) use the same engines when those networks are wired. Authors launch original Stories. Fees either stream to the Author each trade, or stream into an ownerless vault that holders can claim as The Piece. Pairing against a tokenized name is a quote, not studio equity. OnceUpon does not issue studio equity and does not sell shares in NVIDIA, Disney, or anyone else.";

export const TAGLINE = "OnceUponers write the stories. The chain keeps the receipts.";

export const PAD_TAGLINE = "Launch on Solana. Arc is next. Fees that actually move.";

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
      "Every swap pushes that cut to your pad wallet in the same transaction. No claim button.",
      "Protocol takes about 0.20% on top. That cut is not yours to set.",
      "Same engine on Solana now, Arc and Robinhood Chain when those rails go live.",
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
    headline: "Not listed as a quote mint yet",
    badge: "Gated",
    summary:
      "This pair is not listed as a quote mint yet. Launch against SOL or USDC, or paste a real mint when a licensed issuer lists that name.",
    how: [
      "A Story can pair against a listed tokenized asset. That is a quote pair, not studio equity.",
      "Until a licensed issuer lists the name on the chain you chose, the pair stays gated unless you paste an existing mint.",
      "A gated pair is not a waitlist for shares. Childhood language is aesthetic only.",
    ],
  },
] as const;

export const PAIR_TYPES = [
  {
    id: "sol" as const,
    label: "SOL",
    listed: true,
    body: "The live Solana quote. Bonding, Pump-style, and Pons-style launches all clear in SOL on devnet.",
  },
  {
    id: "usdc" as const,
    label: "USDC",
    listed: true,
    body: "Solana devnet USDC, or Arc pool USDC when that chain is live.",
  },
  {
    id: "meme" as const,
    label: "Any meme / SPL mint",
    listed: true,
    body: "Paste any mint. The vault can auto-buy that bag with OnceUponers fees.",
  },
  {
    id: "rwa" as const,
    label: "Tokenized RWA / single-name",
    listed: false,
    body: "Not listed as a quote mint yet. Launch against SOL, or paste a mint when a licensed issuer lists that name.",
  },
] as const;

export const BONDING_COPY =
  "Solana launches open on a bonding curve. At 2 SOL on devnet the Story marks bonded. Pump.fun-style and Pons-style use the same curve with extra snipe tax. Arc still graduates at 5,000 USDC when that factory ships.";

export const PIECE_EXPLAINER =
  "The Piece is a protocol fee split among current holders of a Story. It is not a dividend, not profit-sharing, and not a return on investment.";

export const AUTHOR_FEE_EXPLAINER =
  "Author fees are a configurable swap fee, pushed on the same transaction as the trade.";

export const RIGHTS_TICK =
  "I have the rights to this art and name. This Story is original work. It is not licensed studio merchandise and it is not a claim on any issuer.";

export const MARGIN_DISCLAIMER =
  "The Margin is a doorway to Jupiter. OnceUpon does not custody margin, does not run a matching engine, and does not set your leverage. Longs and shorts live on Jupiter’s accounts.";

export const RWA_GATE =
  "This pair is not listed as a quote mint yet. Launch against SOL, or paste a mint when a licensed issuer lists that name.";

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
