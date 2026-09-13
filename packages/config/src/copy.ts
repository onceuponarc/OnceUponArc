/** Canonical OnceUpon copy. Keep this file free of forbidden offering language. */

export const POSITIONING =
  "OnceUpon is a social token launchpad on Arc. Open a Chapter Curve in USDC the instant create lands — buyers pay USDC, the vault holds it. The Author does not seed an AMM at print. Graduation opens the book from those vault reserves. Authors launch original Stories. Fees either stream to the Author each trade, or stream into an ownerless vault that holders can claim as The Piece. OnceUpon does not issue studio equity and does not sell shares in NVIDIA, Disney, or anyone else.";

export const TAGLINE = "OnceUponers write the stories. The chain keeps the receipts.";

export const PAD_TAGLINE = "Open the Chapter. Buyers write the book.";

export const MODE_COPY = {
  author: {
    title: "Creator fees",
    headline: "Paid on every trade",
    body: "Your cut lands in the Arc test wallet on every buy and sell. No claim button.",
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
    summary: "Your cut is pushed to the Arc wallet in the same transaction as the swap.",
    how: [
      "Pick a creator fee from 0% to 3.00%. The choice is locked when you launch.",
      "Every buy and sell pushes that cut to the Arc wallet in the same transaction. No claim button.",
      "Protocol takes 0.20% on top. That cut is not yours to set. Curve fees cap at 4.00%.",
      "This is a native Arc Chapter in USDC. You do not deposit inventory. You do not seed an AMM at print.",
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
      "You deposit USDC into the Story vault when you choose.",
      "Holders claim in proportion to their current holding versus circulating supply.",
      "Selling before you claim forfeits unsaved share. The Piece is a protocol split — not a dividend.",
    ],
  },
  {
    id: "rwa" as const,
    title: "A name is a Story",
    headline: "USDC on Arc",
    badge: "Quote is USDC",
    summary:
      "Childhood language is aesthetic. The Chapter quotes USDC on Arc. That is not studio equity and not a claim on any issuer.",
    how: [
      "Buyers pay USDC into the vault. The ticker is the Story, not a claim on an issuer.",
      "Pairing a familiar name is not a claim on that issuer and it is not studio equity.",
      "Graduation opens the Arc book from vault reserves. The Author does not seed an AMM at print.",
    ],
  },
] as const;

export const PAIR_TYPES = [
  {
    id: "usdc" as const,
    label: "USDC",
    listed: true,
    body: "Native Arc quote. Chapters clear in USDC on the curve. Your USDC stays in the book until graduation.",
  },
  {
    id: "curve" as const,
    label: "Chapter Curve",
    listed: true,
    body: "Create with realQuote = 0. Buyers write the book. Graduation seeds the AMM from the vault.",
  },
  {
    id: "fees" as const,
    label: "Fees",
    listed: true,
    body: "Creator cut 0–3.00% plus 0.20% protocol. Curve fees cap at 4.00%.",
  },
  {
    id: "arc" as const,
    label: "Arc",
    listed: true,
    body: "OnceUpon prints on Arc only. Devnet is live. Mainnet Arc is days out.",
  },
] as const;

export const BONDING_COPY =
  "Arc Chapters open a curve the instant create lands. Buyers pay USDC into the vault — the Author does not seed an AMM at print. Default start cap is about $3,000. Graduate target is $5,000. 80% of supply trades on the curve; 20% is reserved for the book at graduation. Your USDC stays in the book until the vault opens the AMM.";

export const PIECE_EXPLAINER =
  "Holder claims pay a share of a rewards pool the author deposits. The share is proportional to current holdings. It is not a dividend, not profit-sharing, and not a return on investment.";

export const AUTHOR_FEE_EXPLAINER =
  "Author fees are a configurable swap fee, pushed on the same transaction as the trade.";

export const RIGHTS_TICK =
  "I have the rights to this art and name. This Story is original work. It is not licensed studio merchandise and it is not a claim on any issuer.";

export const MARGIN_DISCLAIMER =
  "Margin is not the OnceUpon book. OnceUpon does not custody margin, does not run a matching engine, and does not set your leverage.";

export const QUOTE_DISCLAIMER =
  "Chapters quote USDC on Arc. Your USDC stays in the book until graduation. A familiar ticker is a Story name, not studio equity.";

export const RWA_GATE =
  "The Chapter quotes USDC. A gated name is not a waitlist for shares.";

export const CHAPTER_BUYER_NOTE = "Your USDC stays in the book until graduation.";

export function humanizeJupiterQuoteError(raw: { error?: unknown; errorCode?: unknown }): string {
  const code = String(raw.errorCode ?? "");
  const message = typeof raw.error === "string" ? raw.error : "";
  if (code === "TOKEN_NOT_TRADABLE" || /not tradable/i.test(message)) {
    return "This mint is not on Arc. OnceUpon Chapters trade on the Arc curve in USDC.";
  }
  return message || "No route.";
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
