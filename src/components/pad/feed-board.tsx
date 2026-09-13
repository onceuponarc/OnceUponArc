"use client";

import { useMemo, useState } from "react";
import { FEED_TABS, filterFeed, type FeedLaunch, type FeedTab } from "@/lib/feed";
import { EmptyPad, LaunchCard } from "@/components/pad/launch-card";
import { cn } from "@/lib/utils";

const EMPTY: Record<FeedTab, { title: string; body: string }> = {
  new: {
    title: "No new launches yet",
    body: "The first Story on Solana mainnet prints here. Pick Author or OnceUponers and hit Launch.",
  },
  trending: {
    title: "Nothing trending yet",
    body: "Volume ranking goes live with the factory. Until then, this lane stays quiet.",
  },
  curve: {
    title: "Nobody is on the curve",
    body: "Live launches bond until their quote target, then they graduate. Be the first on the curve.",
  },
  bonded: {
    title: "Nothing bonded yet",
    body: "Recently bonded is the graduation tape. Empty until a Story clears its quote target.",
  },
};

export function FeedBoard({ launches }: { launches: FeedLaunch[] }) {
  const [tab, setTab] = useState<FeedTab>("new");
  const shown = useMemo(() => filterFeed(launches, tab), [launches, tab]);
  const empty = EMPTY[tab];

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Live pad</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">Feed</h2>
        </div>
        <div className="glass flex flex-wrap gap-1 rounded-full border border-gold/20 p-1">
          {FEED_TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition",
                tab === item.id
                  ? "bg-gold text-ink shadow-[0_0_24px_rgb(201_162_39_/_35%)]"
                  : "text-parchment/70 hover:text-parchment",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-parchment/60">{FEED_TABS.find((item) => item.id === tab)?.hint}</p>
      {shown.length === 0 ? (
        <EmptyPad title={empty.title} body={empty.body} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((launch) => (
            <LaunchCard key={launch.slug} launch={launch} />
          ))}
        </div>
      )}
    </section>
  );
}
