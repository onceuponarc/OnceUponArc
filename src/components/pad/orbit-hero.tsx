import Link from "next/link";
import { formatUsd } from "@/lib/format";

const CHAINS = [
  { id: "solana", label: "Solana", note: "pump.fun bonding curve", radiusPct: 48, angleDeg: -90, accent: "arc" as const },
  { id: "arc", label: "Arc", note: "Uniswap v4 · USDC", radiusPct: 32, angleDeg: 30, accent: "gold" as const },
  { id: "robinhood", label: "Robinhood Chain", note: "Pons v2 spot", radiusPct: 16, angleDeg: 150, accent: "arc" as const },
].map((chain) => {
  const rad = (chain.angleDeg * Math.PI) / 180;
  return {
    ...chain,
    left: 50 + chain.radiusPct * Math.cos(rad),
    top: 50 + chain.radiusPct * Math.sin(rad),
  };
});

export function OrbitHero({
  liveCount,
  bondedCount,
  volumeUi,
  handle,
}: {
  liveCount: number;
  bondedCount: number;
  volumeUi: number;
  handle: string | null;
}) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent">
      <div className="grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-14">
        <div>
          <p className="text-sm text-arc/80">{handle ? `Welcome back, @${handle}` : "One desk, three chains"}</p>
          <h1 className="font-display mt-3 text-[2.75rem] leading-[1.05] sm:text-6xl">
            Launch where your community already trades.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/60">
            OrbitX signs every launch from an in-app desk wallet — no Phantom, no MetaMask. Pick a chain, set your
            terms, and your token is tradable the moment it lands.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/launch"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-transform hover:-translate-y-0.5"
            >
              Launch a token
            </Link>
            <Link
              href="/cards"
              className="rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/80 transition-colors hover:border-white/30 hover:text-white"
            >
              Explore press cards
            </Link>
          </div>
          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-6">
            <div>
              <dt className="text-xs text-white/40">Live on Arc</dt>
              <dd className="font-display mt-1 text-3xl">{liveCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/40">Graduated</dt>
              <dd className="font-display mt-1 text-3xl">{bondedCount}</dd>
            </div>
            <div>
              <dt className="text-xs text-white/40">Volume traded</dt>
              <dd className="font-display mt-1 text-3xl text-gold">{formatUsd(volumeUi)}</dd>
            </div>
          </dl>
        </div>

        <div className="orbit-stage mx-auto aspect-square w-full max-w-sm">
          <div className="orbit-ring" data-spin="slow" style={{ inset: "0%" }} />
          <div className="orbit-ring" data-spin="med" style={{ inset: "16%" }} />
          <div className="orbit-ring" style={{ inset: "32%" }} />
          <div className="absolute inset-[42%] rounded-full bg-gradient-to-br from-arc to-gold" />
          {CHAINS.map((chain) => (
            <div
              key={chain.id}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 text-center"
              style={{ left: `${chain.left}%`, top: `${chain.top}%` }}
            >
              <span className={`orbit-node size-2.5 ${chain.accent === "gold" ? "text-gold" : "text-arc"}`} />
              <span className="whitespace-nowrap text-[11px] font-medium text-white/80">{chain.label}</span>
              <span className="whitespace-nowrap text-[10px] text-white/35">{chain.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
