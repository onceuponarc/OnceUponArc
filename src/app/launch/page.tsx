import { ChainChooser } from "@/components/launch/chain-chooser";
import { LaunchTypeGrid, PairStrip } from "@/components/pad/launch-types";
import { BONDING_COPY } from "@onceupon/config/copy";
import { VENUES } from "@onceupon/config/solana";
import Link from "next/link";

export const metadata = { title: "Launch" };

export default function LaunchPage() {
  return (
    <div className="space-y-10">
      <section className="glass relative overflow-hidden rounded-3xl border border-gold/25 px-6 py-8 sm:px-10">
        <div className="pointer-events-none absolute -right-10 top-0 size-56 rounded-full bg-burgundy/25 blur-3xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">The Press</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold sm:text-5xl">Choose a chain.</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          Solana, Ethereum, Base, and Robinhood Chain are open. Tokens print on Solana mainnet today so the
          Story is live immediately. Other chains tag the launch so you can bind a foreign pool after.
          Circle Arc is not open yet.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-parchment/55">{BONDING_COPY}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-parchment/60">
          {VENUES.map((venue) => (
            <span key={venue.id} className="rounded-full border border-gold/25 px-3 py-1">
              {venue.title}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm">
          Fast path:{" "}
          <Link href="/launch/solana" className="text-gold hover:underline">
            open the Solana press
          </Link>
          .
        </p>
      </section>

      <section className="space-y-4" id="chains">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Chain</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">Where this Story lives</h2>
        </div>
        <ChainChooser />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Engines</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">How each fee path works</h2>
        </div>
        <LaunchTypeGrid detailed />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Pairs</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">What you launch against</h2>
        </div>
        <PairStrip />
      </section>
    </div>
  );
}
