import type { Metadata } from "next";
import Link from "next/link";
import { viewAllCards } from "@/lib/cards/resolve";
import { CardDeck } from "@/components/cards/card-deck";
import { loadPadMarket } from "@/lib/market";
import { tokenOfTheDay } from "@/lib/feed";
import { formatUsd } from "@/lib/format";
import { KingBanner } from "@/components/pad/king-banner";
import { LiveTape } from "@/components/pad/live-tape";
import { LiveRefresh } from "@/components/pad/live-refresh";
import { ChannelStrip } from "@/components/pad/channel-strip";
import { FlywheelRow } from "@/components/pad/flywheel-row";
import { DropClock } from "@/components/pad/drop-clock";
import { OFFICIAL_TOKEN } from "@/lib/official-token";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Drop — launch day",
  description: "OrbitX is live on Arc Devnet. Launch a Chapter. Print a jacket. Official token CA only from official channels.",
  openGraph: {
    title: "OrbitX drop",
    description: "Print a Chapter. Print a jacket. Let MC move both.",
    url: "/drop",
  },
};

const PLAY = [
  { n: "01", t: "Sign in with X", d: "Your desk, banner, and follow button come from the account." },
  { n: "02", t: "Pick a flywheel", d: "Chapter token, tweet spawn, jacket only, or token + card." },
  { n: "03", t: "Trade the curve", d: "USDC in and out anytime. No seeded AMM at create." },
  { n: "04", t: "Graduate", d: "Hit the target. Reserved supply seeds the deeper pool." },
];

export default async function DropPage() {
  const [{ launches, tape }, cards] = await Promise.all([
    loadPadMarket(),
    viewAllCards().catch(() => []),
  ]);
  const live = launches.filter((row) => row.status === "live").length;
  const volume = launches.reduce((sum, row) => sum + row.volumeUi, 0);
  const totd = tokenOfTheDay(launches);

  return (
    <div className="space-y-8">
      <LiveRefresh intervalMs={2000} />
      <section className="relative isolate overflow-hidden rounded-[2rem] border border-white/15 min-h-[72dvh]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/banner.jpg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/75 to-black" />
        <div className="links-sheen pointer-events-none absolute inset-0" />
        <div className="relative flex min-h-[72dvh] flex-col justify-end px-5 py-10 sm:px-12 sm:py-16">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/55">
            OrbitX · Arc · <DropClock />
          </p>
          <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight sm:text-7xl lg:text-8xl">
            The desk is open.
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/65 sm:text-xl">
            Launch a USDC Chapter. Print a 3D jacket from a tweet. Card value = start price × live MC / start MC.
            Two books. One story.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/launch" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black">
              Launch now
            </Link>
            <Link href="/cards/new" className="rounded-full border border-white/25 px-6 py-3 text-sm">
              Print a jacket
            </Link>
            <Link href="/links" className="rounded-full border border-white/25 px-6 py-3 text-sm">
              Official links
            </Link>
          </div>
          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            <Stat k="Live" v={String(live)} />
            <Stat k="Volume" v={formatUsd(volume)} />
            <Stat k="Jackets" v={String(cards.length)} />
          </dl>
        </div>
      </section>

      <ChannelStrip />
      <FlywheelRow />

      <section className="grid gap-3 md:grid-cols-4">
        {PLAY.map((row) => (
          <article key={row.n} className="rounded-3xl border border-white/10 p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">{row.n}</p>
            <h2 className="mt-2 text-xl font-semibold">{row.t}</h2>
            <p className="mt-2 text-sm text-white/50">{row.d}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-amber-300/25 bg-amber-300/[0.05] px-5 py-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-200/80">Official token · $ORBITX live</p>
        <p className="mt-2 max-w-3xl text-lg text-white/80">{OFFICIAL_TOKEN.liveRule}</p>
        <Link href="/params" className="mt-3 inline-block text-sm text-amber-100 underline">
          Read the fee waterfall
        </Link>
      </section>

      {totd ? <KingBanner launch={totd} /> : null}
      {cards.length ? <CardDeck cards={cards.slice(0, 10)} /> : null}
      <LiveTape initial={tape} />
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-3">
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{k}</dt>
      <dd className="mt-1 text-xl font-semibold tabular-nums">{v}</dd>
    </div>
  );
}
