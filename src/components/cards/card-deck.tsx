"use client";

import { useEffect, useRef, useState } from "react";
import type { CardView } from "@/lib/cards/types";
import { CardJacket } from "@/components/cards/card-jacket";

export function CardDeck({ cards }: { cards: CardView[] }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    function paint() {
      const node = scroller.current;
      if (!node) return;
      const width = node.clientWidth || 1;
      setIndex(Math.round(node.scrollLeft / width));
    }
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(paint);
    }
    paint();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
    };
  }, [cards.length]);

  useEffect(() => {
    if (cards.length < 2) return;
    const id = window.setInterval(() => {
      const node = scroller.current;
      if (!node) return;
      const next = (index + 1) % cards.length;
      node.scrollTo({ left: next * node.clientWidth, behavior: "smooth" });
    }, 5200);
    return () => window.clearInterval(id);
  }, [cards.length, index]);

  function go(next: number) {
    const node = scroller.current;
    if (!node) return;
    const clamped = (next + cards.length) % cards.length;
    node.scrollTo({ left: clamped * node.clientWidth, behavior: "smooth" });
  }

  if (!cards.length) return null;

  return (
    <div className="relative isolate z-0 overflow-hidden rounded-3xl border border-white/10">
      <div
        ref={scroller}
        className="flex h-[min(72dvh,640px)] snap-x snap-mandatory overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {cards.map((card) => (
          <section key={card.slug} className="flex h-full w-full shrink-0 snap-center items-center justify-center px-4 py-8">
            <CardJacket card={card} href={`/cards/${card.slug}`} />
          </section>
        ))}
      </div>
      <div className="flex items-center justify-center gap-3 px-4 pb-5">
        <button type="button" onClick={() => go(index - 1)} className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
          Prev
        </button>
        <div className="flex gap-2">
          {cards.map((card, i) => (
            <button
              key={card.slug}
              type="button"
              onClick={() => go(i)}
              className={`h-1.5 rounded-full ${i === index ? "w-8 bg-white" : "w-2 bg-white/25"}`}
            />
          ))}
        </div>
        <button type="button" onClick={() => go(index + 1)} className="rounded-full border border-white/15 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
          Next
        </button>
      </div>
    </div>
  );
}
