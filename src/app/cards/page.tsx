import type { Metadata } from "next";
import Link from "next/link";
import { viewAllCards } from "@/lib/cards/resolve";
import { CardDeck } from "@/components/cards/card-deck";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Press cards",
  description: "3D tradable jackets. Price tracks paired Chapter MC. Coin and card stay separate.",
};

export default async function CardsPage() {
  const cards = await viewAllCards();
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Press</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Tradable cards</h1>
          <p className="mt-2 max-w-xl text-white/55">
            Paste a tweet. Pick a start price. If the paired token MC 4xs, the jacket 4xs. Buyers pay the creator in
            USDC. The coin tape is a different market.
          </p>
        </div>
        <Button asChild>
          <Link href="/cards/new">Print a card</Link>
        </Button>
      </section>
      {cards.length ? (
        <CardDeck cards={cards} />
      ) : (
        <p className="rounded-3xl border border-white/10 px-5 py-16 text-center text-white/45">
          No jackets yet. Print one from an X post.
        </p>
      )}
    </div>
  );
}
