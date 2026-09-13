import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Sparkline } from "@/components/pad/sparkline";
import { tickerHue, type FeedLaunch } from "@/lib/feed";
import { formatCompact, formatPct, formatUsd, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

function Avatar({ launch }: { launch: FeedLaunch }) {
  const hue = tickerHue(launch.ticker);
  return (
    <div
      className="relative size-11 shrink-0 overflow-hidden rounded-2xl border border-white/10"
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 42%), hsl(${(hue + 40) % 360} 60% 18%))` }}
    >
      {launch.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={launch.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span className="flex h-full items-center justify-center font-heading text-sm font-bold">
          {launch.ticker.slice(0, 3)}
        </span>
      )}
    </div>
  );
}

export function TokenRow({ launch }: { launch: FeedLaunch }) {
  const up = launch.changePct >= 0;
  return (
    <Link
      href={`/story/${launch.slug}`}
      className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-white/15 hover:bg-white/[0.04] sm:grid-cols-[minmax(0,1.4fr)_90px_minmax(72px,0.7fr)_minmax(64px,0.55fr)_72px_56px]"
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar launch={launch} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-base font-semibold tracking-tight">${launch.ticker}</p>
            <Badge variant="outline">{launch.status === "graduated" ? "Graduated" : "Live"}</Badge>
          </div>
          <p className="truncate text-xs text-parchment/55">
            {launch.title}
            {launch.handle ? ` · @${launch.handle}` : ""}
            {" · "}
            {timeAgo(launch.createdAt)}
          </p>
        </div>
      </div>
      <Sparkline points={launch.spark} up={up} className="hidden sm:block" />
      <div className="text-right">
        <p className="font-medium tabular-nums">{formatUsd(launch.priceUi, 4)}</p>
        <p className={cn("text-xs tabular-nums", up ? "text-buy" : "text-sell")}>{formatPct(launch.changePct)}</p>
      </div>
      <p className="hidden text-right text-sm tabular-nums text-parchment/80 sm:block">{formatUsd(launch.volumeUi)}</p>
      <p className="hidden text-right text-sm tabular-nums text-parchment/70 sm:block">{formatCompact(launch.holders)}</p>
      <p className="text-right text-[11px] uppercase tracking-wide text-parchment/45">
        {launch.status === "graduated" ? "Bonded" : `${(launch.progressBps / 100).toFixed(0)}%`}
      </p>
    </Link>
  );
}

export function LaunchCard({ launch }: { launch: FeedLaunch }) {
  const hue = tickerHue(launch.ticker);
  const up = launch.changePct >= 0;
  return (
    <Link href={`/story/${launch.slug}`} className="group block h-full">
      <article className="glass flex h-full flex-col overflow-hidden rounded-2xl border border-arc/15 transition duration-300 hover:-translate-y-0.5 hover:border-arc/50">
        <div
          className="relative h-24 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, hsl(${hue} 48% 16%), hsl(${(hue + 48) % 360} 55% 28%), hsl(${(hue + 170) % 360} 32% 12%))`,
          }}
        >
          {launch.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={launch.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
          <div className="absolute inset-x-4 bottom-3 flex items-end justify-between">
            <p className="font-heading text-2xl font-bold tracking-tight text-white">${launch.ticker}</p>
            <span className={cn("text-sm font-semibold tabular-nums", up ? "text-buy" : "text-sell")}>
              {formatPct(launch.changePct)}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="font-heading text-lg font-semibold leading-tight group-hover:text-arc">{launch.title}</h3>
          <div className="flex items-center justify-between">
            <Sparkline points={launch.spark} up={up} />
            <p className="text-sm tabular-nums text-parchment/80">{formatUsd(launch.priceUi, 4)}</p>
          </div>
          <div className="mt-auto flex flex-wrap gap-1.5 text-[11px] text-parchment/55">
            <span>{formatUsd(launch.volumeUi)} vol</span>
            <span>· {launch.holders} holders</span>
            <span>· {launch.pairLabel}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function EmptyPad({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div className={cn("glass rounded-2xl border border-dashed border-arc/25 px-6 py-14 text-center", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">The pad is open</p>
      <h3 className="font-heading mt-3 text-2xl font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-parchment/65">{body}</p>
    </div>
  );
}
