import Link from "next/link";
import type { CardView } from "@/lib/cards/types";
import { formatUsd } from "@/lib/format";

export function CardRail({ cards, title = "Press cards" }: { cards: CardView[]; title?: string }) {
  if (!cards.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">{title}</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Jackets</h2>
        </div>
        <Link href="/cards" className="text-sm text-white/50 underline">
          All cards
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {cards.map((card) => (
          <Link
            key={card.slug}
            href={`/cards/${card.slug}`}
            className="w-56 shrink-0 overflow-hidden rounded-3xl border border-white/10"
          >
            <div className="h-28 bg-white/5">
              {card.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.coverUrl} alt="" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="p-3">
              <p className="font-semibold">${card.ticker}</p>
              <p className="truncate text-sm text-white/50">{card.title}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-white/35">
                {formatUsd(card.valueUi)} · {card.multiple.toFixed(2)}x
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
