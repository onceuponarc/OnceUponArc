"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FEED_TABS, filterFeed, isListedLaunch, type FeedLaunch, type FeedTab } from "@/lib/feed";
import { EmptyPad, TokenRow } from "@/components/pad/launch-card";
import { TokenDeck } from "@/components/pad/token-deck";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EMPTY: Record<FeedTab, { title: string; body: string }> = {
  new: {
    title: "No launches yet",
    body: "Be first. Launch a token on Arc Devnet — it is tradable the moment create lands.",
  },
  trending: {
    title: "Nothing trending yet",
    body: "Volume ranks as soon as the first buy hits a curve.",
  },
  curve: {
    title: "Nobody is graduating",
    body: "Live tokens bond until their USDC target, then they graduate.",
  },
  bonded: {
    title: "Nothing graduated yet",
    body: "Graduated is the pool tape.",
  },
};

export function FeedBoard({ launches }: { launches: FeedLaunch[] }) {
  const [tab, setTab] = useState<FeedTab>("trending");
  const [q, setQ] = useState("");
  const listed = useMemo(() => launches.filter(isListedLaunch), [launches]);
  const shown = useMemo(() => {
    const rows = filterFeed(listed, tab);
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (item) =>
        item.ticker.toLowerCase().includes(needle) ||
        item.title.toLowerCase().includes(needle) ||
        (item.handle ?? "").toLowerCase().includes(needle),
    );
  }, [listed, tab, q]);
  const empty = EMPTY[tab];

  return (
    <section className="space-y-4 pad-fade">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Board</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight">Tokens</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ticker, name, handle"
            className="sm:w-64"
          />
          <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 p-1">
            {FEED_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  tab === item.id ? "bg-white text-black" : "text-white/60 hover:text-white",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="text-sm text-white/50 sm:text-left">{FEED_TABS.find((item) => item.id === tab)?.hint}</p>
      <div className="hidden px-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/30 sm:grid sm:grid-cols-[minmax(0,1.4fr)_90px_minmax(72px,0.7fr)_minmax(64px,0.55fr)_72px_56px]">
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
              <Link href="/launch/arc">Launch a token</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <TokenDeck launches={shown} />
          <div className="space-y-1">
            {shown.map((launch) => (
              <TokenRow key={launch.slug} launch={launch} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
