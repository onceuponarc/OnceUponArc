import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeedBoard } from "@/components/pad/feed-board";
import { LiveTape } from "@/components/pad/live-tape";
import { ArcDevnetWallet } from "@/components/arc/devnet-wallet";
import { loadPadMarket } from "@/lib/market";
import { getSessionUser } from "@/lib/auth";
import { PROTOCOL } from "@onceupon/config/arc";
import { BONDING_COPY, PAD_TAGLINE, QUOTE_DISCLAIMER } from "@onceupon/config/copy";
import Link from "next/link";
import { formatUsd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { profile } = await getSessionUser();
  const { launches, tape } = await loadPadMarket();
  const liveCount = launches.filter((item) => item.status === "live").length;
  const bondedCount = launches.filter((item) => item.status === "graduated").length;
  const volume = launches.reduce((sum, item) => sum + item.volumeUi, 0);

  return (
    <div className="space-y-8">
      <section className="glass relative overflow-hidden rounded-[28px] border border-arc/25 px-5 py-7 sm:px-10">
        <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-arc/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 size-64 rounded-full bg-secondary/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-arc">
              Social launchpad · Arc
            </p>
            <h1 className="font-heading mt-3 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              Open a Chapter.
              <span className="block bg-gradient-to-r from-arc via-parchment to-secondary bg-clip-text text-transparent">
                Watch the tape.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-parchment/75 sm:text-lg">{PAD_TAGLINE}</p>
            <p className="mt-2 max-w-xl text-sm text-parchment/55">{QUOTE_DISCLAIMER}</p>
            <p className="mt-2 max-w-xl text-sm text-parchment/45">{BONDING_COPY}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="rounded-full">
                <Link href="/launch/arc">Launch on Arc</Link>
              </Button>
              <Button variant="outline" asChild className="rounded-full">
                <Link href="/wallet">Trade</Link>
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass rounded-2xl border border-arc/20 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">Pad stats</p>
              <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-parchment/50">Live</dt>
                  <dd className="font-heading text-2xl font-bold">{liveCount}</dd>
                </div>
                <div>
                  <dt className="text-parchment/50">Graduated</dt>
                  <dd className="font-heading text-2xl font-bold">{bondedCount}</dd>
                </div>
                <div>
                  <dt className="text-parchment/50">Tape</dt>
                  <dd className="font-heading text-2xl font-bold">{formatUsd(volume)}</dd>
                </div>
                <div>
                  <dt className="text-parchment/50">Protocol</dt>
                  <dd className="font-heading text-2xl font-bold">
                    {(PROTOCOL.protocolBpsDefault / 100).toFixed(2)}%
                  </dd>
                </div>
              </dl>
              {profile ? (
                <p className="mt-4 text-xs text-parchment/70">Signed in as @{profile.handle}</p>
              ) : (
                <p className="mt-4 text-xs text-parchment/55">
                  Sign in with X. Arc Devnet uses the funded test wallet to print, buy, and sell.
                </p>
              )}
            </div>
            <ArcDevnetWallet compact />
          </div>
        </div>
      </section>

      <LiveTape initial={tape} />

      <section className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">Home chain</p>
            <h2 className="font-heading mt-1 text-2xl font-bold">Arc. USDC in, tape out.</h2>
          </div>
          <Badge>Mainnet Arc in days</Badge>
        </div>
        <p className="max-w-2xl text-sm text-parchment/65">
          OnceUpon prints on Arc only. The funded Devnet wallet signs create, buy, and sell. Graduation opens the book
          from vault reserves.
        </p>
      </section>

      <FeedBoard launches={launches} />
    </div>
  );
}
