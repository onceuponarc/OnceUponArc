import { ChainChooser } from "@/components/launch/chain-chooser";
import { BONDING_COPY, QUOTE_DISCLAIMER } from "@onceupon/config/copy";
import { CHAINS } from "@onceupon/config/solana";
import Link from "next/link";

export const metadata = { title: "Launch" };

export default function LaunchPage() {
  return (
    <div className="space-y-10">
      <section className="glass relative overflow-hidden rounded-[28px] border border-arc/25 px-5 py-8 sm:px-10">
        <div className="pointer-events-none absolute -right-10 top-0 size-56 rounded-full bg-arc/20 blur-3xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">The Press</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold sm:text-5xl">Pick a chain. Open a Chapter.</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          Three paths. Arc is native Chapter Curve in USDC — launch, buy, and sell on the funded Devnet wallet
          today. Solana prints a full SPL mint on the same curve math. Robinhood Chain tags the Story and binds
          Pons as hop-1 routing.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-parchment/55">{QUOTE_DISCLAIMER}</p>
        <p className="mt-2 max-w-2xl text-sm text-parchment/45">{BONDING_COPY}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-parchment/60">
          {CHAINS.map((chain) => (
            <Link
              key={chain.id}
              href={`/launch/${chain.id}`}
              className="rounded-full border border-arc/25 px-3 py-1 hover:border-arc/60"
            >
              {chain.title}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4" id="chains">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">Chain</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">Where this Story lives</h2>
        </div>
        <ChainChooser />
      </section>
    </div>
  );
}
