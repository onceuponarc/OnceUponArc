"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { readApiJson } from "@/lib/http/read-json";
import type { CardView } from "@/lib/cards/types";

export function OwnerDesk({ card }: { card: CardView }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const share = typeof window === "undefined" ? `/cards/${card.slug}` : `${window.location.origin}/cards/${card.slug}`;

  async function copy() {
    await navigator.clipboard.writeText(share);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cards/${card.slug}/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listed: !card.listed }),
      });
      const body = await readApiJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(body.error ?? "Could not update listing.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update listing.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-3xl border border-white/10 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Your jacket</p>
      <p className="text-sm text-white/55">
        {card.listed ? "Listed. Anyone who pays the live value can take it." : "Unlisted. Relist to sell."}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => void copy()}>
          {copied ? "Copied" : "Copy share link"}
        </Button>
        <Button type="button" onClick={() => void toggle()} disabled={busy}>
          {busy ? "Saving…" : card.listed ? "Delist" : "Relist"}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
