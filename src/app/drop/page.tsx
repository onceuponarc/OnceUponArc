import type { Metadata } from "next";
import Link from "next/link";
import { viewAllCards } from "@/lib/cards/resolve";
import { CardDeck } from "@/components/cards/card-deck";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Drop",
  description: "OnceUpon launch day. Chapters on Arc. Press cards that track MC.",
};

const LINKS = [
  { href: "https://x.com/onceuponarc", label: "X", hint: "@onceuponarc" },
  { href: "https://t.me/onceuponupdates", label: "Updates", hint: "t.me/onceuponupdates" },
  { href: "https://t.me/onceuponarc", label: "Community", hint: "t.me/onceuponarc" },
];

export default async function DropPage() {
  const cards = await viewAllCards().catch(() => []);
  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/15 px-5 py-10 text-center sm:px-10 sm:py-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/banner.jpg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />
        <div className="links-sheen pointer-events-none absolute inset-0" />
        <div className="relative">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/50">OnceUpon · Arc</p>
          <h1 className="mt-3 text-5xl font-semibold tracking-tight sm:text-7xl">The drop is live.</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/60">
            Launch a USDC Chapter. Print a jacket from a tweet. Card value follows MC. Official token CA only from
            these channels when the chain is live.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link href="/launch/arc" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
              Launch a Chapter
            </Link>
            <Link href="/cards/new" className="rounded-full border border-white/20 px-5 py-2.5 text-sm">
              Print a jacket
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        {LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-3xl border border-white/10 px-5 py-4 hover:border-white/30"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">{link.label}</p>
            <p className="mt-1 text-lg font-semibold">{link.hint}</p>
          </a>
        ))}
      </div>

      {cards.length ? <CardDeck cards={cards.slice(0, 8)} /> : null}
    </div>
  );
}
