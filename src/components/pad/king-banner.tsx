import Link from "next/link";
import type { FeedLaunch } from "@/lib/feed";
import { deskScore } from "@/lib/feed";
import { formatUsd } from "@/lib/format";

export function KingBanner({ launch }: { launch: FeedLaunch }) {
  return (
    <Link href={`/story/${launch.slug}`} className="links-stage block">
      <article className="links-card overflow-hidden rounded-[2rem] border border-white/15">
        <div className="grid min-h-[220px] sm:grid-cols-[minmax(0,1.15fr)_280px]">
          <div className="relative flex flex-col justify-end p-6 sm:p-8">
            <div className="links-sheen pointer-events-none absolute inset-0" />
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">King of the desk</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">${launch.ticker}</p>
            <p className="mt-1 text-white/55">{launch.title}</p>
            <p className="mt-4 text-sm text-white/50">
              Score {deskScore(launch).toFixed(2)} · {formatUsd(launch.volumeUi)} vol · {launch.holders} holders
            </p>
          </div>
          <div className="relative min-h-40">
            {launch.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={launch.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-white/5" />
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
