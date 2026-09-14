"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CoverField, type CoverPick } from "@/components/launch/cover-field";
import { readApiJson } from "@/lib/http/read-json";
import type { CardView } from "@/lib/cards/types";

export function OwnerDesk({ card }: { card: CardView }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storySlug, setStorySlug] = useState(card.storySlug ?? "");
  const [pay, setPay] = useState(card.creatorPayAddress);
  const [cover, setCover] = useState<CoverPick | null>(
    card.coverUrl ? { url: card.coverUrl, imageUri: card.coverUrl, cid: null, storage: "supabase" } : null,
  );

  async function copy() {
    const url = `${window.location.origin}/cards/${card.slug}/share`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  async function save(patch: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cards/${card.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const body = await readApiJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(body.error ?? "Could not update.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Your jacket</p>
      <p className="text-sm text-white/55">
        {card.listed ? "Listed. Anyone who pays the live value can take it." : "Unlisted. Relist to sell."}
      </p>
      <CoverField value={cover} onChange={setCover} />
      <div>
        <Label>Pair Chapter slug</Label>
        <Input className="mt-2" value={storySlug} onChange={(e) => setStorySlug(e.target.value)} placeholder="chapter slug" />
      </div>
      <div>
        <Label>USDC receive wallet</Label>
        <Input className="mt-2" value={pay} onChange={(e) => setPay(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => void copy()}>
          {copied ? "Copied" : "Copy share"}
        </Button>
        <Button type="button" onClick={() => void save({ listed: !card.listed })} disabled={busy}>
          {busy ? "Saving…" : card.listed ? "Delist" : "Relist"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => void save({ coverUrl: cover?.url ?? null, storySlug, creatorPayAddress: pay })}
        >
          Save art + pair
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href={`/cards/${card.slug}/share`}>Share frame</a>
        </Button>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
