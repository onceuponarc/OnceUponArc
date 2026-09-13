"use client";

import { useEffect, useState } from "react";
import { CHAIN_POOLS, bindingKindForDex, catalogFor, type DexId } from "@onceupon/config/pools";
import type { LaunchChain } from "@onceupon/config/solana";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XMark } from "@/components/x-mark";
import { PoolPicker, type LinkedPoolPick } from "@/components/launch/pool-picker";

type StoryOption = { slug: string; title: string; ticker: string };

const BIND_CHAINS: LaunchChain[] = ["solana", "arc", "ethereum", "base", "robinhood"];

export function BindingForm({
  signedIn,
  stories,
}: {
  signedIn: boolean;
  stories: StoryOption[];
}) {
  const [storySlug, setStorySlug] = useState(stories[0]?.slug ?? "");
  const [chain, setChain] = useState<LaunchChain>("solana");
  const [pool, setPool] = useState<LinkedPoolPick | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const catalog = catalogFor(chain);

  useEffect(() => {
    if (!storySlug && stories[0]) setStorySlug(stories[0].slug);
  }, [stories, storySlug]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!pool?.address) {
      setError("Pick or paste a live pool first.");
      return;
    }
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/bindings/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storySlug,
          chainCaip2: catalog.caip2,
          poolAddress: pool.address,
          mechanism: pool.dex,
          proofUrl: pool.url || undefined,
          kind: bindingKindForDex((pool.dex as DexId) || "custom"),
          depthUsd: pool.depthUsd,
          quoteAddress: pool.quoteAddress,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Could not bind that pool.");
        return;
      }
      setOk(`Bound ${pool.label} on ${catalog.title}. The Story page shows the pool.`);
    } finally {
      setBusy(false);
    }
  }

  if (!signedIn) {
    return (
      <div className="glass rounded-2xl border border-gold/20 p-6">
        <h2 className="font-heading text-xl font-bold">Sign in to bind a pool</h2>
        <p className="mt-2 text-sm text-parchment/65">Only the Author of a Story can attach a pool.</p>
        <Button asChild className="mt-4" size="sm">
          <a href="/auth/login">
            <XMark className="size-3.5" />
            Sign in with X
          </a>
        </Button>
      </div>
    );
  }

  if (!stories.length) {
    return (
      <div className="glass rounded-2xl border border-gold/20 p-6">
        <h2 className="font-heading text-xl font-bold">No Stories to bind</h2>
        <p className="mt-2 text-sm text-parchment/65">Launch a token first, then attach another pool.</p>
        <Button asChild className="mt-4" size="sm">
          <a href="/launch/solana">Open the Solana press</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="glass space-y-4 rounded-2xl border border-gold/20 p-5">
        <div className="space-y-2">
          <label htmlFor="story" className="text-sm font-medium">
            Story
          </label>
          <select
            id="story"
            value={storySlug}
            onChange={(e) => setStorySlug(e.target.value)}
            className="h-8 w-full rounded-lg border border-gold/25 bg-ink/60 px-2 text-sm"
          >
            {stories.map((story) => (
              <option key={story.slug} value={story.slug}>
                ${story.ticker} — {story.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="chain" className="text-sm font-medium">
            Chain
          </label>
          <select
            id="chain"
            value={chain}
            onChange={(e) => {
              setChain(e.target.value as LaunchChain);
              setPool(null);
            }}
            className="h-8 w-full rounded-lg border border-gold/25 bg-ink/60 px-2 text-sm"
          >
            {BIND_CHAINS.map((id) => (
              <option key={id} value={id}>
                {CHAIN_POOLS[id].title} · {CHAIN_POOLS[id].factories.map((item) => item.name).join(", ") || "OnceUpon"}
              </option>
            ))}
          </select>
          <p className="text-xs text-parchment/50">
            {catalog.factories.map((item) => `${item.name} ${item.address.slice(0, 6)}…`).join(" · ") ||
              "OnceUpon curve"}
          </p>
        </div>
      </div>

      <PoolPicker chain={chain} quoteId="sol" mint="" selected={pool} onSelect={setPool} />

      <Button type="submit" disabled={busy || !pool?.address}>
        {busy ? "Binding…" : "Bind this pool"}
      </Button>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Binding blocked</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {ok ? (
        <Alert>
          <AlertTitle>Bound</AlertTitle>
          <AlertDescription>{ok}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
