import Link from "next/link";
import type { FeedLaunch } from "@/lib/feed";
import { deskScore } from "@/lib/feed";
import { formatUsd } from "@/lib/format";

export function KingBanner({ launch }: { launch: FeedLaunch }) {
  return (
    <Link
      href={`/story/${launch.slug}`}
      className="block overflow-hidden rounded-3xl border border-white bg-white text-black"
    >
      <div className="grid gap-0 sm:grid-cols-[minmax(0,1.2fr)_220px]">
        <div className="px-5 py-5 sm:px-7 sm:py-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black/45">King of the desk</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">${launch.ticker}</p>
          <p className="mt-1 text-black/50">{launch.title}</p>
          <p className="mt-3 text-sm text-black/55">
            Score {deskScore(launch).toFixed(2)} · {formatUsd(launch.volumeUi)} vol · {launch.holders} holders
          </p>
        </div>
        <div className="relative min-h-28 bg-neutral-200">
          {launch.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={launch.coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
        </div>
      </div>
    </Link>
  );
}
