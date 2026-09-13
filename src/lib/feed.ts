import { chapterStartPriceUi, virtualQuoteUiFor } from "@onceupon/config/chapter";
import type { LocalArcStory } from "@/lib/arc/store";

export type FeedLaunch = {
  slug: string;
  title: string;
  ticker: string;
  blurb: string;
  engine: "author" | "onceuponers";
  pairLabel: string;
  authorBps: number;
  status: "draft" | "live" | "graduated" | "paused" | "archived";
  coverUrl: string | null;
  handle: string | null;
  createdAt: string;
  chain?: string;
  venue?: string;
  priceUi: number;
  changePct: number;
  volumeUi: number;
  holders: number;
  spark: number[];
  mcapUi: number;
  progressBps: number;
  lastSide?: "buy" | "sell";
};

export type TapeItem = {
  slug: string;
  ticker: string;
  side: "buy" | "sell";
  quoteUi: number;
  trader: string;
  at: string;
  txHash?: string;
};

export type FeedTab = "new" | "trending" | "curve" | "bonded";

export const FEED_TABS: { id: FeedTab; label: string; hint: string }[] = [
  { id: "new", label: "New", hint: "Just printed. First buys write the book." },
  { id: "trending", label: "Trending", hint: "Volume and tape on the pad right now." },
  { id: "curve", label: "On the curve", hint: "Still bonding. Watch graduation progress." },
  { id: "bonded", label: "Graduated", hint: "Cleared the curve. Book is open." },
];

export function filterFeed(launches: FeedLaunch[], tab: FeedTab): FeedLaunch[] {
  const live = launches.filter((item) => item.status === "live");
  const bonded = launches.filter((item) => item.status === "graduated");
  const byNew = [...launches]
    .filter((item) => item.status === "live" || item.status === "graduated")
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  switch (tab) {
    case "new":
      return byNew;
    case "trending":
      return [...launches]
        .filter((item) => item.status === "live" || item.status === "graduated")
        .sort((a, b) => b.volumeUi - a.volumeUi || +new Date(b.createdAt) - +new Date(a.createdAt));
    case "curve":
      return [...live].sort((a, b) => b.progressBps - a.progressBps);
    case "bonded":
      return bonded;
    default:
      return byNew;
  }
}

export function tickerHue(ticker: string): number {
  let hash = 0;
  for (const char of ticker) hash = (hash * 33 + char.charCodeAt(0)) % 360;
  return hash;
}

export type RawTrade = {
  storyId?: string;
  slug?: string;
  side: string;
  amountIn: number;
  amountOut: number;
  quoteDecimals: number;
  baseDecimals: number;
  trader: string;
  at: string;
  priceUsd?: number | null;
};

function startPrice(pairLabel: string): number {
  if (pairLabel.toUpperCase().includes("USD")) {
    return chapterStartPriceUi(virtualQuoteUiFor(), 1_073_000_000);
  }
  return 0.00003;
}

function sparkFrom(prices: number[], fallback: number): number[] {
  if (prices.length >= 2) return prices.slice(-24);
  if (prices.length === 1) return [fallback, prices[0]];
  const seed = fallback || 0.00001;
  return Array.from({ length: 8 }, (_, i) => seed * (1 + i * 0.004));
}

export function enrichLaunch(
  base: Omit<FeedLaunch, "priceUi" | "changePct" | "volumeUi" | "holders" | "spark" | "mcapUi" | "progressBps"> &
    Partial<Pick<FeedLaunch, "priceUi" | "changePct" | "volumeUi" | "holders" | "spark" | "mcapUi" | "progressBps">>,
  trades: RawTrade[],
  opts?: { curveQuoteUi?: number; graduateUi?: number; supplyUi?: number },
): FeedLaunch {
  const fallback = startPrice(base.pairLabel);
  const prices: number[] = [];
  let volume = 0;
  const holders = new Set<string>();
  let lastSide: "buy" | "sell" | undefined;
  for (const trade of trades) {
    const quoteDec = trade.quoteDecimals || 6;
    const quoteUi =
      trade.side === "buy" ? trade.amountIn / 10 ** quoteDec : trade.amountOut / 10 ** quoteDec;
    const baseDec = trade.baseDecimals || 6;
    const tokensUi =
      trade.side === "buy" ? trade.amountOut / 10 ** baseDec : trade.amountIn / 10 ** baseDec;
    const price = trade.priceUsd || (tokensUi > 0 ? quoteUi / tokensUi : 0);
    if (price > 0) prices.push(price);
    volume += quoteUi;
    if (trade.trader) holders.add(trade.trader);
    lastSide = trade.side === "sell" ? "sell" : "buy";
  }
  const price = prices.at(-1) ?? fallback;
  const first = prices[0] ?? price;
  const changePct = first ? ((price - first) / first) * 100 : 0;
  const supply = opts?.supplyUi ?? 1_000_000_000;
  const graduate = opts?.graduateUi ?? (base.pairLabel.toUpperCase().includes("USD") ? 5000 : 2);
  const raised = opts?.curveQuoteUi ?? 0;
  return {
    ...base,
    priceUi: price,
    changePct,
    volumeUi: volume,
    holders: holders.size,
    spark: sparkFrom(prices, fallback),
    mcapUi: price * supply * 0.000001 * 1_000_000, // keep finite; display uses price * implied float
    progressBps: graduate > 0 ? Math.min(10_000, Math.round((raised / graduate) * 10_000)) : 0,
    lastSide,
  };
}

export function feedFromArc(story: LocalArcStory): FeedLaunch {
  const trades: RawTrade[] = story.trades.map((trade) => ({
    side: trade.side,
    amountIn: Number(trade.amountIn),
    amountOut: Number(trade.amountOut),
    quoteDecimals: 6,
    baseDecimals: 18,
    trader: trade.trader,
    at: trade.tradedAt,
    priceUsd: trade.priceUsd,
  }));
  return enrichLaunch(
    {
      slug: story.slug,
      title: story.title,
      ticker: story.ticker,
      blurb: story.blurb,
      engine: story.engine,
      pairLabel: story.pairLabel,
      authorBps: story.authorBps,
      status: story.status,
      coverUrl: story.coverUrl,
      handle: story.handle,
      createdAt: story.createdAt,
      chain: "arc",
      venue: "spl",
    },
    trades,
    {
      curveQuoteUi: Number(story.curveQuoteRaw) / 1e6,
      graduateUi: Number(story.graduationQuoteRaw) / 1e6,
      supplyUi: 1_000_000_000,
    },
  );
}
