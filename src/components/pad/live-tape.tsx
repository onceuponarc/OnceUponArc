"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatUsd, timeAgo } from "@/lib/format";
import type { TapeItem } from "@/lib/feed";
import { cn } from "@/lib/utils";
import { MARKET_EVENT } from "@/lib/live-market";

export function LiveTape({ initial }: { initial: TapeItem[] }) {
  const [tape, setTape] = useState(initial);

  useEffect(() => {
    function pull() {
      fetch("/api/market/tape", { cache: "no-store" })
        .then((res) => res.json())
        .then((body: { tape?: TapeItem[] }) => {
          if (Array.isArray(body.tape)) setTape(body.tape);
        })
        .catch(() => undefined);
    }
    pull();
    const timer = window.setInterval(pull, 4000);
    window.addEventListener(MARKET_EVENT, pull);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(MARKET_EVENT, pull);
    };
  }, []);

  if (!tape.length) {
    return (
      <div className="glass overflow-hidden rounded-2xl border border-arc/20 px-4 py-3 text-sm text-parchment/55">
        Live tape is quiet. Launch a token and the first buy prints here.
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
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs transition-colors hover:border-white/30"
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
