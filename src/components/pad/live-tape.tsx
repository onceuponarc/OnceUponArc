"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatUsd, timeAgo } from "@/lib/format";
import type { TapeItem } from "@/lib/feed";
import { cn } from "@/lib/utils";

export function LiveTape({ initial }: { initial: TapeItem[] }) {
  const [tape, setTape] = useState(initial);

  useEffect(() => {
    const timer = window.setInterval(() => {
      fetch("/api/market/tape")
        .then((res) => res.json())
        .then((body: { tape?: TapeItem[] }) => {
          if (Array.isArray(body.tape)) setTape(body.tape);
        })
        .catch(() => undefined);
    }, 4000);
    return () => window.clearInterval(timer);
  }, []);

  if (!tape.length) {
    return (
      <div className="glass overflow-hidden rounded-2xl border border-arc/20 px-4 py-3 text-sm text-parchment/55">
        Live tape is quiet. Open a Chapter and the first buy prints here.
      </div>
    );
  }

  return (
    <div className="glass relative overflow-hidden rounded-2xl border border-arc/20">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2">
        <span className="size-1.5 animate-pulse rounded-full bg-buy" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">Live tape</p>
      </div>
      <div className="flex gap-3 overflow-x-auto px-3 py-2.5 [scrollbar-width:none]">
        {tape.map((item) => (
          <Link
            key={`${item.txHash ?? item.at}-${item.slug}-${item.trader}`}
            href={`/story/${item.slug}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1 text-xs"
          >
            <span className={cn("font-semibold uppercase", item.side === "buy" ? "text-buy" : "text-sell")}>
              {item.side}
            </span>
            <span className="font-heading font-bold">${item.ticker}</span>
            <span className="text-parchment/70">{formatUsd(item.quoteUi)}</span>
            <span className="text-parchment/40">{timeAgo(item.at)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
