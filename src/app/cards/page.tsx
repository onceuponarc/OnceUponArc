import type { Metadata } from "next";
import Link from "next/link";
import { viewAllCards } from "@/lib/cards/resolve";
import { CardsBoard } from "@/components/cards/cards-board";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Press cards",
  description: "3D tradable jackets with art. Price tracks paired Chapter MC. Coin and card stay separate.",
};

export default async function CardsPage() {
  const cards = await viewAllCards().catch(() => []);
  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Press</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">Tradable cards</h1>
          <p className="mt-2 max-w-2xl text-white/55">
            Upload art or paste a tweet. Pick a start price. If the paired Chapter MC 4xs, the jacket 4xs. Listed
            jackets are for sale. Held jackets sit on a profile until relisted.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/launch/arc">Launch types</Link>
          </Button>
          <Button asChild>
            <Link href="/cards/new">Print a card</Link>
          </Button>
        </div>
      </section>
      <CardsBoard cards={cards} />
    </div>
  );
}
