import { cn } from "@/lib/utils";
import { formatUsd, timeAgo } from "@/lib/format";

export type ChartTrade = {
  at: string;
  priceUsd: number;
  side: "buy" | "sell";
  quoteUi: number;
};

export function PriceChart({
  trades,
  fallbackPrice,
}: {
  trades: ChartTrade[];
  fallbackPrice: number;
}) {
  const prices = trades.map((item) => item.priceUsd).filter((value) => value > 0);
  const series = prices.length ? prices : [fallbackPrice, fallbackPrice * 1.01];
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || fallbackPrice || 1;
  const coords = series.map((value, i) => {
    const x = (i / Math.max(1, series.length - 1)) * 100;
    const y = 100 - ((value - min) / span) * 88 - 6;
    return [x, y] as const;
  });
  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const area = `${line} L100 100 L0 100 Z`;
  const last = series.at(-1) ?? fallbackPrice;
  const first = series[0] ?? last;
  const up = last >= first;
  const vol = trades.reduce((sum, item) => sum + item.quoteUi, 0);

  return (
    <div className="glass overflow-hidden rounded-2xl border border-arc/20">
      <div className="flex flex-wrap items-end justify-between gap-3 px-5 pt-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">Chapter chart</p>
          <p className="font-heading mt-1 text-3xl font-bold tabular-nums">{formatUsd(last, 6)}</p>
        </div>
        <div className="text-right text-sm text-parchment/60">
          <p className={up ? "text-buy" : "text-sell"}>
            {up ? "+" : ""}
            {(((last - first) / (first || 1)) * 100).toFixed(2)}%
          </p>
          <p>{formatUsd(vol)} tape</p>
        </div>
      </div>
      <svg viewBox="0 0 100 100" className="mt-2 h-52 w-full" preserveAspectRatio="none">
        <path d={area} fill={up ? "rgb(0 229 195 / 16%)" : "rgb(255 77 122 / 14%)"} />
        <path d={line} fill="none" stroke={up ? "#00e5c3" : "#ff4d7a"} strokeWidth="1.4" />
      </svg>
      <div className="flex justify-between px-5 pb-4 text-[11px] text-parchment/40">
        <span>{trades[0] ? timeAgo(trades[0].at) : "open"}</span>
        <span>now</span>
      </div>
    </div>
  );
}

export function HoldersTable({
  holders,
}: {
  holders: { address: string; bought: number; sold: number; net: number }[];
}) {
  if (!holders.length) {
    return (
      <div className="glass rounded-2xl border border-arc/15 px-4 py-8 text-center text-sm text-parchment/55">
        No holders yet. The first buy creates the book.
      </div>
    );
  }
  return (
    <div className="glass overflow-hidden rounded-2xl border border-arc/15">
      <div className="border-b border-white/5 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">Holders</p>
      </div>
      <ul className="divide-y divide-white/5">
        {holders.map((row) => (
          <li key={row.address} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
            <span className="font-mono text-xs text-parchment/70">
              {row.address.slice(0, 6)}…{row.address.slice(-4)}
            </span>
            <span className={cn("tabular-nums", row.net >= 0 ? "text-buy" : "text-sell")}>
              {row.net.toLocaleString("en-US", { maximumFractionDigits: 2 })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StoryTape({ trades }: { trades: ChartTrade[] }) {
  if (!trades.length) {
    return (
      <div className="glass rounded-2xl border border-arc/15 px-4 py-8 text-center text-sm text-parchment/55">
        Buys and sells print here the moment they land.
      </div>
    );
  }
  return (
    <div className="glass overflow-hidden rounded-2xl border border-arc/15">
      <div className="border-b border-white/5 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">Buys & sells</p>
      </div>
      <ul className="max-h-80 divide-y divide-white/5 overflow-auto">
        {[...trades].reverse().map((trade, index) => (
          <li key={`${trade.at}-${index}`} className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
            <span className={cn("font-semibold uppercase", trade.side === "buy" ? "text-buy" : "text-sell")}>
              {trade.side}
            </span>
            <span className="tabular-nums text-parchment/80">{formatUsd(trade.quoteUi)}</span>
            <span className="text-xs text-parchment/40">{timeAgo(trade.at)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
