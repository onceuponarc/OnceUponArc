"use client";

import { useEffect, useState } from "react";
import { CHAIN_POOLS, catalogFor } from "@onceupon/config/pools";
import type { LaunchChain } from "@onceupon/config/solana";
import { findQuoteByMint } from "@onceupon/config/quotes";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XMark } from "@/components/x-mark";
import { PoolPicker, type LinkedPoolPick } from "@/components/launch/pool-picker";
import { readApiJson } from "@/lib/http/read-json";

type StoryOption = { slug: string; title: string; ticker: string; quoteMint?: string | null; pairLabel?: string | null };

const BIND_CHAINS: LaunchChain[] = ["solana", "arc", "ethereum", "base", "robinhood"];

export function BindingForm({
  signedIn,
  stories,
  initialSlug,
}: {
  signedIn: boolean;
  stories: StoryOption[];
  initialSlug?: string;
}) {
  const [storySlug, setStorySlug] = useState(initialSlug || stories[0]?.slug || "");
  const [chain, setChain] = useState<LaunchChain>("solana");
  const [quoteId, setQuoteId] = useState("sol");
  const [quoteMint, setQuoteMint] = useState("");
  const [pool, setPool] = useState<LinkedPoolPick | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const catalog = catalogFor(chain);
  const selectedStory = stories.find((item) => item.slug === storySlug);

  useEffect(() => {
    if (!storySlug && stories[0]) setStorySlug(stories[0].slug);
  }, [stories, storySlug]);

  useEffect(() => {
    if (!storySlug) return;
    const listed = stories.find((item) => item.slug === storySlug);
    if (listed?.quoteMint) {
      setQuoteMint(listed.quoteMint);
      setQuoteId(findQuoteByMint(listed.quoteMint)?.id ?? "custom");
      return;
    }
    fetch(`/api/stories/${storySlug}`)
      .then((res) => res.json())
      .then((body: { quote_mint?: string | null; pair_label?: string }) => {
        const mint = body.quote_mint ?? "";
        setQuoteMint(mint);
        setQuoteId(findQuoteByMint(mint || null)?.id ?? "sol");
      })
      .catch(() => undefined);
  }, [storySlug, stories]);

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
          depthUsd: pool.depthUsd,
          quoteAddress: pool.quoteAddress ?? quoteMint,
          label: pool.label,
        }),
      });
      const body = await readApiJson<{ error?: string; label?: string }>(res);
      if (!res.ok) {
        setError(body.error ?? "Could not bind that pool.");
        return;
      }
      setOk(`Bound ${body.label ?? pool.label} on ${catalog.title}. Open the Story to see it.`);
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
        <p className="mt-2 text-sm text-parchment/65">Launch a token first, then attach a pool.</p>
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
            onChange={(e) => {
              setStorySlug(e.target.value);
              setPool(null);
            }}
            className="h-8 w-full rounded-lg border border-gold/25 bg-ink/60 px-2 text-sm"
          >
            {stories.map((story) => (
              <option key={story.slug} value={story.slug}>
                ${story.ticker} — {story.title}
                {story.pairLabel ? ` · ${story.pairLabel}` : ""}
              </option>
            ))}
          </select>
          {selectedStory?.pairLabel ? (
            <p className="text-xs text-parchment/50">
              This launch quotes {selectedStory.pairLabel}. Bind that live pool, or paste a ${selectedStory.ticker} LP
              you opened after print.
            </p>
          ) : null}
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

      <PoolPicker
        chain={chain}
        quoteId={quoteId}
        mint={quoteMint}
        selected={pool}
        onSelect={setPool}
        heading="Link a live pool"
      />

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
