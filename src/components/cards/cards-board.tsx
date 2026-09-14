"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CardView } from "@/lib/cards/types";
import { CardDeck } from "@/components/cards/card-deck";
import { CardJacket } from "@/components/cards/card-jacket";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

type Sort = "new" | "value" | "multiple";
type Filter = "listed" | "all" | "held";

export function CardsBoard({ cards }: { cards: CardView[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("new");
  const [filter, setFilter] = useState<Filter>("listed");

  const shown = useMemo(() => {
    let rows = cards;
    if (filter === "listed") rows = rows.filter((row) => row.listed);
    if (filter === "held") rows = rows.filter((row) => !row.listed);
    const needle = q.trim().toLowerCase();
    if (needle) {
      rows = rows.filter(
        (row) =>
          row.ticker.toLowerCase().includes(needle) ||
          row.title.toLowerCase().includes(needle) ||
          row.ownerHandle.toLowerCase().includes(needle) ||
          (row.tweetHandle ?? "").toLowerCase().includes(needle),
      );
    }
    return [...rows].sort((a, b) => {
      if (sort === "value") return b.valueUi - a.valueUi;
      if (sort === "multiple") return b.multiple - a.multiple;
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
  }, [cards, q, sort, filter]);

  const listed = cards.filter((row) => row.listed);
  const floor = listed.length ? Math.min(...listed.map((row) => row.valueUi)) : 0;
  const volume = cards.reduce((sum, row) => sum + row.valueUi, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Jackets" value={String(cards.length)} />
        <Stat label="Listed" value={String(listed.length)} />
        <Stat label="Floor" value={listed.length ? formatUsd(floor) : "—"} />
        <Stat label="Marked value" value={formatUsd(volume)} />
      </div>

      {cards.length ? <CardDeck cards={filter === "listed" ? listed : cards} /> : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search ticker, owner, tweet"
          className="h-10 rounded-xl border border-white/10 bg-black px-3 text-sm outline-none placeholder:text-white/30"
        />
        <div className="flex flex-wrap gap-2">
          {(["listed", "all", "held"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm capitalize",
                filter === id ? "border-white bg-white text-black" : "border-white/15 text-white/55",
              )}
            >
              {id}
            </button>
          ))}
          {(["new", "value", "multiple"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setSort(id)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm capitalize",
                sort === id ? "border-white/40 text-white" : "border-white/10 text-white/40",
              )}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {shown.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((card) => (
            <div key={card.slug} className="flex justify-center px-2 py-4">
              <CardJacket card={card} href={`/cards/${card.slug}`} compact />
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-3xl border border-white/10 px-5 py-16 text-center text-white/45">
          {cards.length ? "No jackets match that filter." : "No jackets yet. Print one from a tweet or upload art."}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}
