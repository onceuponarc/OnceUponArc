/** Canonical OnceUpon copy. Keep this file free of forbidden offering language. */

export const POSITIONING =
  "OnceUpon is a token launchpad on Arc. Authors launch original Stories. Fees either stream to the Author each trade, or stream into an ownerless vault that holders can claim as The Piece. Some Stories may later pair against listed tokenized assets. OnceUpon does not issue studio equity and does not sell shares in NVIDIA, Disney, or anyone else.";

export const TAGLINE = "OnceUponers write the stories. The chain keeps the receipts.";

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
