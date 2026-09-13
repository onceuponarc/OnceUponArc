import { ChainChooser } from "@/components/launch/chain-chooser";
import { LaunchTypeGrid, PairStrip } from "@/components/pad/launch-types";
import { BONDING_COPY, QUOTE_DISCLAIMER } from "@onceupon/config/copy";
import { VENUES } from "@onceupon/config/solana";
import Link from "next/link";

export const metadata = { title: "Launch" };

export default function LaunchPage() {
  return (
    <div className="space-y-10">
      <section className="glass relative overflow-hidden rounded-[28px] border border-arc/25 px-5 py-8 sm:px-10">
        <div className="pointer-events-none absolute -right-10 top-0 size-56 rounded-full bg-arc/20 blur-3xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">The Press</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold sm:text-5xl">Pick a chain. Pair any asset.</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          Arc is home. Solana, Ethereum, Base, and Robinhood Chain are open too. Tokens print on Solana
          mainnet today so the Story is live on a Chapter Curve immediately — SOL, Bitcoin, Ether, stocks,
          memes, or any mint. Tag a live DEX pool as hop-1 routing. Other chains also bind a destination-chain
          pool (Uniswap, Aerodrome, Pons) when you choose one.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-parchment/55">{QUOTE_DISCLAIMER}</p>
        <p className="mt-2 max-w-2xl text-sm text-parchment/45">{BONDING_COPY}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-parchment/60">
          {VENUES.map((venue) => (
            <span key={venue.id} className="rounded-full border border-arc/25 px-3 py-1">
              {venue.title}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm">
          Fast path:{" "}
          <Link href="/launch/arc" className="text-arc hover:underline">
            open the Arc press
          </Link>
          .
        </p>
      </section>

      <section className="space-y-4" id="chains">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">Chain</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">Where this Story lives</h2>
        </div>
        <ChainChooser />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">Engines</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">How each fee path works</h2>
        </div>
        <LaunchTypeGrid detailed />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">Pairs</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">What you launch against</h2>
        </div>
        <PairStrip />
      </section>
    </div>
  );
}
