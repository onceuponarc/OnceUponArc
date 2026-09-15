import { FeedBoard } from "@/components/pad/feed-board";
import { LiveRefresh } from "@/components/pad/live-refresh";
import { OrbitHero } from "@/components/pad/orbit-hero";
import { loadPadMarket } from "@/lib/market";
import { getSessionUser } from "@/lib/auth";
import { tokenOfTheDay } from "@/lib/feed";
import Link from "next/link";
import { LivePulse } from "@/components/pad/live-pulse";
import { viewAllCards } from "@/lib/cards/resolve";
import { CardRail } from "@/components/cards/card-rail";
import { FlywheelRow } from "@/components/pad/flywheel-row";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { profile } = await getSessionUser();
  const { launches } = await loadPadMarket();
  const liveCount = launches.filter((item) => item.status === "live").length;
  const bondedCount = launches.filter((item) => item.status === "graduated").length;
  const volume = launches.reduce((sum, item) => sum + item.volumeUi, 0);
  const chainCounts = {
    solana: launches.filter((item) => item.chain === "solana").length,
    arc: launches.filter((item) => !item.chain || item.chain === "arc").length,
    robinhood: launches.filter((item) => item.chain === "robinhood").length,
  };
  const totd = tokenOfTheDay(launches);
  const cards = await viewAllCards().catch(() => []);

  return (
    <div className="space-y-8">
      <LiveRefresh intervalMs={2000} />
      <LivePulse />
      <OrbitHero
        liveCount={liveCount}
        bondedCount={bondedCount}
        volumeUi={volume}
        handle={profile?.handle ?? null}
        chainCounts={chainCounts}
      />
      {cards.length ? <CardRail cards={cards.slice(0, 12)} /> : null}
      <FeedBoard launches={launches} king={totd} />
      <FlywheelRow />
      <Link
        href="/params"
        className="block rounded-2xl border border-gold/20 bg-gold/[0.04] px-5 py-4 transition-colors hover:border-gold/35"
      >
        <p className="text-sm font-medium text-gold">Official token · $ORBITX live</p>
        <p className="mt-1 text-base text-white/75">CA 13H4WJvGEg4xrrBwWn2vsQgz7xhmhxgNdw19i1QsxPX9 · Friday Arc mainnet.</p>
      </Link>
    </div>
  );
}
