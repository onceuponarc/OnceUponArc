/** Canonical OnceUpon copy. Keep this file free of forbidden offering language. */

export const POSITIONING =
  "OnceUpon is a token launchpad on Arc. Authors launch original Stories. Fees either stream to the Author each trade, or stream into an ownerless vault that holders can claim as The Piece. Some Stories may later pair against listed tokenized assets. OnceUpon does not issue studio equity and does not sell shares in NVIDIA, Disney, or anyone else.";

export const TAGLINE = "OnceUponers write the stories. The chain keeps the receipts.";

export const PAD_TAGLINE = "Launch on Arc. Trade in USDC. Fees that actually move.";

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
      "Every swap pushes that cut to your bound Arc wallet in the same transaction. No claim button.",
      "Protocol takes about 0.20% on top. That cut is not yours to set.",
      "Best when you are the one writing, and you want the flow to hit your wallet live.",
    ],
  },
  {
    id: "onceuponers" as const,
    title: "OnceUponers",
    headline: "Share the book",
    badge: "Author cap 1.00%",
    summary: "Fees land in a vault no one owns. Holders claim The Piece.",
    how: [
      "Author fee caps at 1.00%. The rest of the author-side flow goes to an ownerless vault.",
      "Holders claim The Piece from that vault. Staff cannot skim it. There is no admin key.",
      "The Piece is a protocol fee split among current holders — not a dividend, not profit-sharing.",
      "Selling before you claim forfeits unsaved accumulator. The vault has no owner to chase.",
    ],
  },
  {
    id: "rwa" as const,
    title: "Tokenized RWA / single-name",
    headline: "Not listed on Arc yet",
    badge: "Gated",
    summary:
      "This pair is not on Arc yet. Launch against USDC, or ask to be notified when a licensed issuer lists that name.",
    how: [
      "OnceUpon can later pair a Story against a listed tokenized asset. That is a quote pair, not studio equity.",
      "Until a licensed issuer lists the name on Arc, the pair stays gated. You launch in USDC or EURC instead.",
      "A gated pair is not a waitlist for shares. Childhood language is aesthetic only.",
    ],
  },
] as const;

export const PAIR_TYPES = [
  {
    id: "usdc" as const,
    label: "USDC",
    listed: true,
    body: "The live quote. Pool USDC is the 6-decimal ERC-20 on Arc. Gas is native USDC with 18 decimals — do not mix them.",
  },
  {
    id: "eurc" as const,
    label: "EURC",
    listed: true,
    body: "Euro-denominated quote, listed on Arc testnet.",
  },
  {
    id: "rwa" as const,
    label: "Tokenized RWA / single-name",
    listed: false,
    body: "Not listed on Arc yet. Launch against USDC until a licensed issuer lists that name.",
  },
] as const;

export const BONDING_COPY =
  "Launches open on a bonding curve. At 5,000 USDC the Story graduates into the pool. New is what just printed. Trending is what is moving. On the curve is still bonding. Recently bonded already cleared the threshold.";

export const PIECE_EXPLAINER =
  "The Piece is a protocol fee split among current holders of a Story. It is not a dividend, not profit-sharing, and not a return on investment.";

export const AUTHOR_FEE_EXPLAINER =
  "Author fees are a configurable swap fee, pushed on the same transaction as the trade.";

export const RIGHTS_TICK =
  "I have the rights to this art and name. This Story is original work. It is not licensed studio merchandise and it is not a claim on any issuer.";

export const MARGIN_DISCLAIMER =
  "The Margin is a doorway to Jupiter. OnceUpon does not custody margin, does not run a matching engine, and does not set your leverage. Longs and shorts live on Jupiter’s accounts.";

export const RWA_GATE =
  "This pair is not on Arc yet. Launch against USDC, or ask to be notified when a licensed issuer lists that name.";

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
