"use client";

import Link from "next/link";
import type { CardView } from "@/lib/cards/types";
import { formatUsd } from "@/lib/format";

export function CardJacket({ card, href }: { card: CardView; href?: string }) {
  const inner = (
    <article
      data-token-card
      className="relative h-full w-full max-w-md origin-center overflow-hidden rounded-[2rem] border border-white/15 bg-black shadow-[0_40px_120px_rgba(0,0,0,0.55)]"
    >
      <div
        className="relative h-full min-h-[420px] overflow-hidden rounded-[2rem]"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - rect.left) / rect.width - 0.5;
          const y = (event.clientY - rect.top) / rect.height - 0.5;
          event.currentTarget.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
          event.currentTarget.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.setProperty("--rx", "0deg");
          event.currentTarget.style.setProperty("--ry", "0deg");
        }}
        style={{ transform: "rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))", transformStyle: "preserve-3d" }}
      >
        {card.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.coverUrl} alt="" className="absolute inset-0 h-[58%] w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.16),transparent_40%),#080808]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
        <div className="links-sheen pointer-events-none absolute inset-0" />
        <div className="relative flex h-full min-h-[420px] flex-col justify-end p-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
            {card.tweetHandle ? `@${card.tweetHandle}` : "Press card"} · {card.flywheel}
          </p>
          <h3 className="mt-2 text-5xl font-semibold tracking-tight">${card.ticker}</h3>
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
      </div>
    </article>
  );
  if (!href) return inner;
  return <Link href={href}>{inner}</Link>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 px-2 py-2">
      <p className="text-sm font-semibold tabular-nums">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">{label}</p>
    </div>
  );
}
