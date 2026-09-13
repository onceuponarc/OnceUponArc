export type ChartTrade = {
  at: string;
  priceUsd: number;
  side: "buy" | "sell";
  quoteUi: number;
};

export type ChartTf = "1s" | "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export const CHART_TFS: { id: ChartTf; label: string; seconds: number }[] = [
  { id: "1s", label: "1s", seconds: 1 },
  { id: "1m", label: "1m", seconds: 60 },
  { id: "5m", label: "5m", seconds: 300 },
  { id: "15m", label: "15m", seconds: 900 },
  { id: "1h", label: "1h", seconds: 3600 },
  { id: "4h", label: "4h", seconds: 14_400 },
  { id: "1d", label: "1D", seconds: 86_400 },
];

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export function candlesFromTrades(trades: ChartTrade[], tf: ChartTf, fallbackPrice: number): Candle[] {
  const seconds = CHART_TFS.find((item) => item.id === tf)?.seconds ?? 60;
  const sorted = [...trades]
    .filter((item) => item.priceUsd > 0)
    .sort((a, b) => +new Date(a.at) - +new Date(b.at));
  if (!sorted.length) {
    const now = Math.floor(Date.now() / 1000);
    const start = now - seconds * 24;
    return Array.from({ length: 24 }, (_, i) => {
      const time = start + i * seconds;
      const wobble = fallbackPrice * (1 + Math.sin(i / 3) * 0.004);
      return { time, open: wobble, high: wobble * 1.002, low: wobble * 0.998, close: wobble, volume: 0 };
    });
  }
  const buckets = new Map<number, Candle>();
  for (const trade of sorted) {
    const ts = Math.floor(+new Date(trade.at) / 1000);
    const bucket = Math.floor(ts / seconds) * seconds;
    const prev = buckets.get(bucket);
    if (!prev) {
      buckets.set(bucket, {
        time: bucket,
        open: trade.priceUsd,
        high: trade.priceUsd,
        low: trade.priceUsd,
        close: trade.priceUsd,
        volume: trade.quoteUi,
      });
    } else {
      prev.high = Math.max(prev.high, trade.priceUsd);
      prev.low = Math.min(prev.low, trade.priceUsd);
      prev.close = trade.priceUsd;
      prev.volume += trade.quoteUi;
    }
  }
  const list = [...buckets.values()].sort((a, b) => a.time - b.time);
  if (list.length === 1) {
    const only = list[0];
    return [
      { ...only, time: only.time - seconds, volume: 0 },
      only,
    ];
  }
  return list;
}
