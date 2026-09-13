"use client";

import { useEffect, useState } from "react";
import { CHAINS } from "@onceupon/config/solana";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XMark } from "@/components/x-mark";

type StoryOption = { slug: string; title: string; ticker: string };

export function BindingForm({
  signedIn,
  stories,
}: {
  signedIn: boolean;
  stories: StoryOption[];
}) {
  const [storySlug, setStorySlug] = useState(stories[0]?.slug ?? "");
  const [chainCaip2, setChainCaip2] = useState(CHAINS.find((c) => c.id === "ethereum")?.caip2 ?? "eip155:1");
  const [poolAddress, setPoolAddress] = useState("");
  const [mechanism, setMechanism] = useState("uniswap");
  const [proofUrl, setProofUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    if (!storySlug && stories[0]) setStorySlug(stories[0].slug);
  }, [stories, storySlug]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/bindings/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storySlug,
          chainCaip2,
          poolAddress,
          mechanism,
          proofUrl: proofUrl || undefined,
          kind: "linked_other",
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Could not bind that pool.");
        return;
      }
      setOk("Binding recorded. The Story page will show the foreign pool.");
      setPoolAddress("");
    } finally {
      setBusy(false);
    }
  }

  if (!signedIn) {
    return (
      <div className="glass rounded-2xl border border-gold/20 p-6">
        <h2 className="font-heading text-xl font-bold">Sign in to bind a pool</h2>
        <p className="mt-2 text-sm text-parchment/65">Only the Author of a Story can attach a foreign pool.</p>
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
        <p className="mt-2 text-sm text-parchment/65">Launch a token first, then attach a pool on another chain.</p>
        <Button asChild className="mt-4" size="sm">
          <a href="/launch/solana">Open the Solana press</a>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass space-y-4 rounded-2xl border border-gold/20 p-5">
      <div className="space-y-2">
        <Label htmlFor="story">Story</Label>
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
        <Label htmlFor="chain">Foreign chain</Label>
        <select
          id="chain"
          value={chainCaip2}
          onChange={(e) => setChainCaip2(e.target.value)}
          className="h-8 w-full rounded-lg border border-gold/25 bg-ink/60 px-2 text-sm"
        >
          {CHAINS.filter((chain) => chain.id !== "solana").map((chain) => (
            <option key={chain.id} value={chain.caip2}>
              {chain.title} ({chain.caip2})
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="pool">Pool address</Label>
        <Input
          id="pool"
          value={poolAddress}
          onChange={(e) => setPoolAddress(e.target.value)}
          placeholder="0x… or Solana pubkey"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="mech">Mechanism</Label>
        <Input id="mech" value={mechanism} onChange={(e) => setMechanism(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="proof">Proof URL (optional)</Label>
        <Input id="proof" value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder="https://" />
      </div>
      <Button type="submit" disabled={busy || !poolAddress}>
        {busy ? "Binding…" : "Bind foreign pool"}
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
