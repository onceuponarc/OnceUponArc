"use client";

import Link from "next/link";
import { useState } from "react";
import type { CardView } from "@/lib/cards/types";
import { formatUsd } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CardJacket({
  card,
  href,
  spin = true,
  compact = false,
}: {
  card: CardView;
  href?: string;
  spin?: boolean;
  compact?: boolean;
}) {
  const [paused, setPaused] = useState(false);
  const height = compact ? "min-h-[280px]" : "min-h-[420px]";

  const rig = (
    <div className={cn("jacket-scene w-full max-w-md", compact ? "h-[280px]" : "h-[420px]")}>
      <div
        className={cn("jacket-rig", (!spin || paused) && "is-paused")}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={(event) => {
          setPaused(false);
          event.currentTarget.style.transform = "";
        }}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          event.currentTarget.style.transform = `rotateX(${(-y * 16).toFixed(2)}deg) rotateY(${(x * 22).toFixed(2)}deg)`;
        }}
      >
        <Face card={card} side="front" height={height} />
        <Face card={card} side="back" height={height} />
      </div>
    </div>
  );

  if (!href) return rig;
  return (
    <Link href={href} className="block w-full max-w-md">
      {rig}
    </Link>
  );
}

function Face({
  card,
  side,
  height,
}: {
  card: CardView;
  side: "front" | "back";
  height: string;
}) {
  return (
    <article
      className={cn(
        "jacket-face border border-white/15 bg-black shadow-[0_40px_120px_rgba(0,0,0,0.55)]",
        side === "back" && "jacket-back",
      )}
    >
      <div className={cn("relative flex h-full flex-col justify-end p-6", height)}>
        {card.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.coverUrl}
            alt=""
            className={cn("absolute inset-0 w-full object-cover", side === "front" ? "h-[58%]" : "h-full opacity-40")}
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.16),transparent_40%),#080808]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
        <div className="links-sheen pointer-events-none absolute inset-0" />
        {side === "front" ? (
          <div className="relative">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
              {card.tweetHandle ? `@${card.tweetHandle}` : "Press card"} · {card.flywheel}
            </p>
            <h3 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">${card.ticker}</h3>
            <p className="mt-1 truncate text-sm text-white/55">{card.title}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <Stat label="Now" value={formatUsd(card.valueUi)} />
              <Stat label="Start" value={formatUsd(card.startPriceUi)} />
              <Stat label="MC ×" value={`${card.multiple.toFixed(2)}x`} />
            </div>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">
              Owner @{card.ownerHandle}
              {card.listed ? " · listed" : ""}
            </p>
          </div>
        ) : (
          <div className="relative">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Reverse</p>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight">${card.ticker}</h3>
            <p className="mt-2 line-clamp-4 text-sm text-white/60">{card.blurb}</p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">
              {card.listed ? "For sale" : "Held"} · {formatUsd(card.startMcapUi)} start MC
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 px-2 py-2">
      <p className="text-sm font-semibold tabular-nums">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">{label}</p>
    </div>
  );
}
