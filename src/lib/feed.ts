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
};

export type FeedTab = "new" | "trending" | "curve" | "bonded";

export const FEED_TABS: { id: FeedTab; label: string; hint: string }[] = [
  { id: "new", label: "New launches", hint: "Just printed on the pad." },
  { id: "trending", label: "Trending", hint: "What the pad is watching." },
  { id: "curve", label: "On the curve", hint: "Still bonding. 5,000 USDC to graduate." },
  { id: "bonded", label: "Recently bonded", hint: "Cleared the curve. In the pool." },
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
      return [...live].sort((a, b) => a.ticker.localeCompare(b.ticker));
    case "curve":
      return live;
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
