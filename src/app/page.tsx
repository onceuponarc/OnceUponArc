import { FeedBoard } from "@/components/pad/feed-board";
import { LiveTape } from "@/components/pad/live-tape";
import { LiveRefresh } from "@/components/pad/live-refresh";
import { loadPadMarket } from "@/lib/market";
import { getSessionUser } from "@/lib/auth";
import { PROTOCOL } from "@onceupon/config/arc";
import { tokenOfTheDay } from "@/lib/feed";
import { formatUsd } from "@/lib/format";
import Link from "next/link";
import { KingBanner } from "@/components/pad/king-banner";
import { LivePulse } from "@/components/pad/live-pulse";
import { viewAllCards } from "@/lib/cards/resolve";
import { CardRail } from "@/components/cards/card-rail";
import { DropBanner } from "@/components/pad/drop-banner";
import { FlywheelRow } from "@/components/pad/flywheel-row";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { profile } = await getSessionUser();
  const { launches, tape } = await loadPadMarket();
  const liveCount = launches.filter((item) => item.status === "live").length;
  const bondedCount = launches.filter((item) => item.status === "graduated").length;
  const volume = launches.reduce((sum, item) => sum + item.volumeUi, 0);
  const totd = tokenOfTheDay(launches);
  const cards = await viewAllCards().catch(() => []);

  return (
    <div className="space-y-8">
      <LiveRefresh intervalMs={2000} />
      <div className="flex items-center justify-between gap-3">
        <LivePulse />
        <p className="hidden font-mono text-[11px] uppercase tracking-[0.16em] text-white/35 sm:block">
          {profile ? `@${profile.handle}` : "Sign in with X"}
        </p>
      </div>
      <DropBanner />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Live", String(liveCount)],
          ["Graduated", String(bondedCount)],
          ["Volume", formatUsd(volume)],
          ["Fee", `${(PROTOCOL.protocolBpsDefault / 100).toFixed(2)}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 px-4 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
          </div>
        ))}
      </div>
      <FlywheelRow />
      {cards.length ? <CardRail cards={cards.slice(0, 12)} /> : null}
      {totd ? <KingBanner launch={totd} /> : null}
      <LiveTape initial={tape} />
      <FeedBoard launches={launches} />
      <Link
        href="/params"
        className="block rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] px-5 py-4"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-200/80">Official token · $ORBITX live</p>
        <p className="mt-1 text-base text-white/75">CA 13H4WJvGEg4xrrBwWn2vsQgz7xhmhxgNdw19i1QsxPX9 · Friday Arc mainnet.</p>
      </Link>
    </div>
  );
}
