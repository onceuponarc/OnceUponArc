import Link from "next/link";

const MAINNET = new Date("2026-09-16T00:00:00-04:00").getTime();

export function ArcDeskBar() {
  const days = Math.max(0, Math.ceil((MAINNET - Date.now()) / 86_400_000));
  return (
    <section className="grid gap-3 lg:grid-cols-3">
      <div className="rounded-2xl border border-white/10 px-4 py-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Arc</p>
        <p className="mt-1 text-lg font-semibold">
          {days > 0 ? `Public mainnet in ${days} day${days === 1 ? "" : "s"}` : "Arc public mainnet window"}
        </p>
        <p className="mt-1 text-sm text-white/50">USDC is gas. Sub-second finality. Quote is always dollars.</p>
      </div>
      <div className="rounded-2xl border border-white/10 px-4 py-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">On-ramp</p>
        <p className="mt-1 text-lg font-semibold">Get test USDC</p>
        <p className="mt-1 text-sm text-white/50">
          <a className="underline hover:text-white" href="https://faucet.circle.com" target="_blank" rel="noreferrer">
            Circle faucet
          </a>
          {" · "}
          <a className="underline hover:text-white" href="https://www.circle.com/cross-chain-transfer-protocol" target="_blank" rel="noreferrer">
            CCTP
          </a>
          {" when mainnet USDC moves."}
        </p>
      </div>
      <Link href="/week" className="rounded-2xl border border-white/10 px-4 py-4 hover:border-white/30">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Friday burn</p>
        <p className="mt-1 text-lg font-semibold">Weekly best Chapter</p>
        <p className="mt-1 text-sm text-white/50">5% of pad creator fees buy the winner and burn it.</p>
      </Link>
    </section>
  );
}
