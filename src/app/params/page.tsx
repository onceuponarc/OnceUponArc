import type { Metadata } from "next";
import Link from "next/link";
import { exampleDay, FEE_WATERFALL, FEE_WATERFALL_BPS, OFFICIAL_TOKEN } from "@/lib/official-token";

export const metadata: Metadata = {
  title: "Params · official token",
  description:
    "OnceUpon creator-fee split. Official token is not live. CA only from official OnceUpon channels when the chain is live.",
};

export default function ParamsPage() {
  const day = exampleDay();
  const pot = day.reduce((sum, row) => sum + row.usd, 0);

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-black px-5 py-8 text-center sm:px-10 sm:py-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/banner.jpg"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/80 to-black" />
        <p className="relative font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">/params</p>
        <h1 className="relative mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Official token + fee split</h1>
        <p className="relative mx-auto mt-4 max-w-2xl text-base text-white/70">
          Pad creator fees follow a locked 75 / 25 waterfall. The official token uses this same loop. It is not live.
        </p>
        <p className="relative mx-auto mt-4 inline-block rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-amber-200">
          Not live · no CA on this site
        </p>
      </section>

      <section className="rounded-3xl border border-amber-300/25 bg-amber-300/[0.06] px-5 py-6 text-center sm:px-8 sm:text-left">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-amber-200/80">Official token</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{OFFICIAL_TOKEN.name}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/75">{OFFICIAL_TOKEN.liveRule}</p>
        <p className="mt-3 font-mono text-sm text-white/45">Contract address: unpublished</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
          {OFFICIAL_TOKEN.channels.map((row) => (
            <Link
              key={row.href}
              href={row.href}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:border-white/40 hover:text-white"
            >
              {row.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10">
        <div className="border-b border-white/10 px-5 py-5 text-center sm:px-8 sm:text-left">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Creator-fee slice</p>
          <h2 className="mt-1 text-2xl font-semibold">75% build the company · 25% fuel the token + pad</h2>
          <p className="mt-2 text-sm text-white/55">
            Units are basis points of the creator-fee slice, not of total volume. Shares sum to {FEE_WATERFALL_BPS.toLocaleString()}{" "}
            bps and lock after first config.
          </p>
        </div>
        <div className="grid sm:grid-cols-5">
          {FEE_WATERFALL.map((row) => (
            <div key={row.id} className="border-t border-white/10 px-4 py-5 text-center sm:border-t-0 sm:border-l sm:first:border-l-0">
              <p className="text-3xl font-semibold tabular-nums">{row.share}</p>
              <p className="mt-2 text-sm font-medium">{row.label}</p>
              <p className="mt-2 text-xs leading-5 text-white/45">{row.job}</p>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">{row.bps} bps</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 px-5 py-6 sm:px-8">
        <h2 className="text-center text-xl font-semibold sm:text-left">Worked day · $100,000 volume at 0.30%</h2>
        <p className="mt-1 text-center text-sm text-white/50 sm:text-left">
          Creator-fee pot ${pot.toFixed(0)}. Same weights the official token uses when it is live.
        </p>
        <div className="mt-4 divide-y divide-white/10">
          {day.map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="text-white/70">{row.label}</span>
              <span className="tabular-nums text-white">${row.usd.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/10 p-5 sm:p-6">
          <h2 className="text-xl font-semibold">How the official token works</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-white/65">
            <li>8% of the pad creator-fee slice buys the official token and burns it.</li>
            <li>5% buys the week’s best launch and burns that coin.</li>
            <li>6% rewards holders. 6% team, vested. 75% builds the company.</li>
            <li>No CA, no buy link, no chart until official channels post it.</li>
          </ul>
        </div>
        <div className="rounded-3xl border border-white/10 p-5 sm:p-6">
          <h2 className="text-xl font-semibold">Ignore anywhere else</h2>
          <p className="mt-3 text-sm leading-6 text-white/65">
            Anyone posting a mint, “stealth CA,” or “official ticker live” outside X @onceuponarc and the Telegram rooms is
            not us. When Arc / the chain is live, we post the address there first. This page will stay “unpublished” until
            that post exists.
          </p>
          <Link href="/links" className="mt-4 inline-block text-sm text-white underline">
            Official links
          </Link>
        </div>
      </section>
    </div>
  );
}
