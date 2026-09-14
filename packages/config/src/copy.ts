/** Canonical OnceUpon copy. Keep this file free of forbidden offering language. */

export const POSITIONING =
  "OnceUpon is a token launchpad on Arc. Launch a curve in USDC the moment create lands. Buyers pay USDC into the vault. You do not seed an AMM at launch. Graduation opens the pool from those reserves. Fees stream to the creator on each trade, or into a holder-claim vault. OnceUpon does not issue studio equity and does not sell shares in NVIDIA, Disney, or anyone else.";

export const TAGLINE = "Launch on Arc. Trade the curve. Graduate the pool.";

export const PAD_TAGLINE = "Arc launchpad · USDC in, tape out.";

export const MODE_COPY = {
  author: {
    title: "Creator fees",
    headline: "Paid on every trade",
    body: "Your cut lands in the connected Arc wallet on every buy and sell. No claim button.",
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
      "This is a native Arc launch in USDC. You do not deposit inventory. You do not seed an AMM at launch.",
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
      "You deposit USDC into the token vault when you choose.",
      "Holders claim in proportion to their current holding versus circulating supply.",
      "Selling before you claim forfeits unsaved share. That split is a protocol mechanic — not a dividend.",
    ],
  },
  {
    id: "rwa" as const,
    title: "A ticker is a token",
    headline: "USDC on Arc",
    badge: "Quote is USDC",
    summary: "A familiar name is a ticker, not studio equity and not a claim on any issuer.",
    how: [
      "Buyers pay USDC into the vault. The ticker is the token, not a claim on an issuer.",
      "Pairing a familiar name is not a claim on that issuer and it is not studio equity.",
      "Graduation opens the Arc pool from vault reserves. The creator does not seed an AMM at launch.",
    ],
  },
] as const;

export const PAIR_TYPES = [
  {
    id: "usdc" as const,
    label: "USDC",
    listed: true,
    body: "Native Arc quote. Buy and sell the curve anytime. When the book hits the target, remaining USDC and reserved tokens seed the graduated pool.",
  },
  {
    id: "curve" as const,
    label: "Bonding curve",
    listed: true,
    body: "Create with realQuote = 0. Buyers fill the book. Graduation seeds the AMM from the vault.",
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
    body: "OnceUpon launches on Arc only. Devnet is live. Mainnet Arc is next.",
  },
] as const;

export const BONDING_COPY =
  "Arc launches open a curve the instant create lands. Buy and sell anytime. You do not seed an AMM at print. Buys and sells fill the book; when the $5,000 target hits, remaining quote plus reserved supply seed the deeper pool. 80% of supply trades on the curve; 20% is reserved for graduation.";

export const PIECE_EXPLAINER =
  "Holder claims pay a share of a rewards pool the creator deposits. The share is proportional to current holdings. It is not a dividend, not profit-sharing, and not a return on investment.";

export const AUTHOR_FEE_EXPLAINER =
  "Creator fees are a configurable swap fee, pushed on the same transaction as the trade.";

export const RIGHTS_TICK =
  "I have the rights to this art and name. This token is original work. It is not licensed studio merchandise and it is not a claim on any issuer.";

export const MARGIN_DISCLAIMER =
  "Margin is not the OnceUpon book. OnceUpon does not custody margin, does not run a matching engine, and does not set your leverage.";

export const QUOTE_DISCLAIMER =
  "Launches quote USDC on Arc. Trade the curve anytime. Graduation seeds a deeper pool from the book. A familiar ticker is a name, not studio equity.";

export const RWA_GATE = "The curve quotes USDC. A gated name is not a waitlist for shares.";

export const CHAPTER_BUYER_NOTE = "Buy and sell anytime. USDC in the book seeds the graduated pool when the target hits.";

export function humanizeJupiterQuoteError(raw: { error?: unknown; errorCode?: unknown }): string {
  const code = String(raw.errorCode ?? "");
  const message = typeof raw.error === "string" ? raw.error : "";
  if (code === "TOKEN_NOT_TRADABLE" || /not tradable/i.test(message)) {
    return "This mint is not on Arc. OnceUpon tokens trade on the Arc curve in USDC.";
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
  )} USDC to the creator before the pool fee.`;
}
