import { readFileSync } from "node:fs";
import { humanizeJupiterQuoteError } from "../packages/config/src/copy.ts";

const curve = readFileSync(new URL("../src/components/pad/curve-trade.tsx", import.meta.url), "utf8");
if (curve.includes('pairLabel.includes("USD")')) {
  throw new Error("NVDAx contains USD — that substring must not pick the stable default.");
}
if (!curve.includes("defaultCurveBuyUi")) {
  throw new Error("Curve trade should use defaultCurveBuyUi.");
}

const quotes = readFileSync(new URL("../packages/config/src/quotes.ts", import.meta.url), "utf8");
if (!quotes.includes('if (upper === "USDC" || upper === "USDT" || upper === "PYUSD") return "10"')) {
  throw new Error("Stable default missing.");
}
if (!quotes.includes('return "0.05"')) {
  throw new Error("xStock default missing.");
}

const chapter = readFileSync(new URL("../src/lib/arc/chapter.ts", import.meta.url), "utf8");
if (!chapter.includes("ensureArcDevnet")) {
  throw new Error("Arc trades must auto-wire Anvil + the Chapter Factory before signing.");
}

const story = readFileSync(new URL("../src/app/story/[slug]/page.tsx", import.meta.url), "utf8");
if (story.includes("JupiterSwapPanel")) {
  throw new Error("Story page should not mount Jupiter. OnceUpon trades on Arc.");
}
if (!story.includes("ArcTrade") || !story.includes('chain === "arc"')) {
  throw new Error("Story page should trade Arc Chapters on the curve.");
}

const launch = readFileSync(new URL("../src/app/launch/[chain]/page.tsx", import.meta.url), "utf8");
if (!launch.includes('redirect("/launch/arc")')) {
  throw new Error("Non-Arc launch routes must send people to Arc.");
}

const home = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
if (/launch\/solana|launch\/robinhood|Print SPL|Robinhood Chain/.test(home)) {
  throw new Error("Home must not offer Solana or Robinhood launches.");
}

const blocked = humanizeJupiterQuoteError({
  error: "The token Ftc5kjS46Eh78YV1BVuDuUz5NKX6Y8mF42aVzTjdutBr is not tradable",
  errorCode: "TOKEN_NOT_TRADABLE",
});
if (/Ftc5kjS46Eh78YV1BVuDuUz5NKX6Y8mF42aVzTjdutBr/.test(blocked)) {
  throw new Error("Not-tradable copy should not echo the mint.");
}
if (!/Arc/i.test(blocked)) {
  throw new Error(`unexpected not-tradable copy: ${blocked}`);
}

console.log(JSON.stringify({ ok: true, blocked }, null, 2));
