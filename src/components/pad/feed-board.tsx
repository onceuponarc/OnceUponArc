"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FEED_TABS, filterFeed, type FeedLaunch, type FeedTab } from "@/lib/feed";
import { EmptyPad, TokenRow } from "@/components/pad/launch-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EMPTY: Record<FeedTab, { title: string; body: string }> = {
  new: {
    title: "No launches yet",
    body: "Be the first on the board. Open a Chapter on Arc with the funded Devnet wallet.",
  },
  trending: {
    title: "Nothing trending yet",
    body: "Volume ranks as soon as the first buy hits a Chapter.",
  },
  curve: {
    title: "Nobody is on the curve",
    body: "Live Chapters bond until their USDC target, then they graduate.",
  },
  bonded: {
    title: "Nothing graduated yet",
    body: "Recently bonded is the graduation tape.",
  },
};

export function FeedBoard({ launches }: { launches: FeedLaunch[] }) {
  const [tab, setTab] = useState<FeedTab>("new");
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const rows = filterFeed(launches, tab);
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (item) =>
        item.ticker.toLowerCase().includes(needle) ||
        item.title.toLowerCase().includes(needle) ||
        (item.handle ?? "").toLowerCase().includes(needle),
    );
  }, [launches, tab, q]);
  const empty = EMPTY[tab];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">The board</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">Tokens</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ticker, name, handle"
            className="sm:w-64"
          />
          <div className="glass flex flex-wrap gap-1 rounded-full border border-arc/20 p-1">
            {FEED_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition",
                  tab === item.id ? "bg-arc text-ink" : "text-parchment/70 hover:text-parchment",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-parchment/60">{FEED_TABS.find((item) => item.id === tab)?.hint}</p>
      <div className="hidden px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-parchment/40 sm:grid sm:grid-cols-[minmax(0,1.4fr)_90px_minmax(72px,0.7fr)_minmax(64px,0.55fr)_72px_56px]">
        <span>Token</span>
        <span>Chart</span>
        <span className="text-right">Price</span>
        <span className="text-right">Volume</span>
        <span className="text-right">Holders</span>
        <span className="text-right">Curve</span>
      </div>
      {shown.length === 0 ? (
        <div className="space-y-4">
          <EmptyPad title={empty.title} body={empty.body} />
          <div className="flex justify-center">
            <Button asChild>
              <Link href="/launch/arc">Launch on Arc</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {shown.map((launch) => (
            <TokenRow key={launch.slug} launch={launch} />
          ))}
        </div>
      )}
    </section>
  );
}
