import { Button } from "@/components/ui/button";
import { FeedBoard } from "@/components/pad/feed-board";
import { LiveTape } from "@/components/pad/live-tape";
import { LiveRefresh } from "@/components/pad/live-refresh";
import { loadPadMarket } from "@/lib/market";
import { getSessionUser } from "@/lib/auth";
import { PROTOCOL } from "@onceupon/config/arc";
import { tokenOfTheDay } from "@/lib/feed";
import { formatUsd } from "@/lib/format";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { profile } = await getSessionUser();
  const { launches, tape } = await loadPadMarket();
  const liveCount = launches.filter((item) => item.status === "live").length;
  const bondedCount = launches.filter((item) => item.status === "graduated").length;
  const volume = launches.reduce((sum, item) => sum + item.volumeUi, 0);
  const totd = tokenOfTheDay(launches);

  return (
    <div className="space-y-6">
      <LiveRefresh />
      <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-white/10 bg-black p-5 sm:p-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Arc launchpad</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Launch. Trade.
            <span className="block text-white/50">Graduate.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/55 sm:text-base">
            Bonding curve in USDC on Arc. No seeded AMM at create. Highest volume is token of the day.
            {profile ? ` Signed in as @${profile.handle}.` : " Sign in with X to bind a profile."}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/launch/arc">Launch token</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/wallet">Import wallet</Link>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Live", String(liveCount)],
            ["Graduated", String(bondedCount)],
            ["Volume", formatUsd(volume)],
            ["Fee", `${(PROTOCOL.protocolBpsDefault / 100).toFixed(2)}%`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">{label}</p>
              <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {totd ? (
        <Link
          href={`/story/${totd.slug}`}
          className="block rounded-2xl border border-white bg-white px-5 py-4 text-black transition-transform hover:-translate-y-0.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-black/50">Token of the day</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight">
                ${totd.ticker} <span className="text-black/45">{totd.title}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-black/45">Volume</p>
              <p className="text-2xl font-semibold tabular-nums">{formatUsd(totd.volumeUi)}</p>
            </div>
          </div>
        </Link>
      ) : null}

      <LiveTape initial={tape} />
      <FeedBoard launches={launches} />
    </div>
  );
}
