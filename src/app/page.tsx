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
      <FeedBoard launches={launches} king={totd} />
      {cards.length ? <CardRail cards={cards.slice(0, 12)} /> : null}
      <Link
        href="/whitepaper"
        className="block rounded-2xl border border-white/10 px-5 py-4 text-center text-sm text-white/60 transition-colors hover:border-white/25 hover:text-white"
      >
        Read the whitepaper — how launches, Press Cards, and $ORBITX actually work →
      </Link>
    </div>
  );
}
