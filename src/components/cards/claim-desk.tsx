"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readApiJson } from "@/lib/http/read-json";
import type { CardView } from "@/lib/cards/types";
import { formatUsd } from "@/lib/format";

export function ClaimDesk({ card }: { card: CardView }) {
  const router = useRouter();
  const [tx, setTx] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function copyPay() {
    await navigator.clipboard.writeText(card.creatorPayAddress);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  async function claim() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/cards/${card.slug}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tx }),
      });
      const body = await readApiJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(body.error ?? "Claim failed.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!card.listed) {
    return (
      <div className="rounded-3xl border border-white/10 p-5 text-sm text-white/55">
        This jacket is held by @{card.ownerHandle}. Not listed.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Buy this jacket</p>
      <p className="text-3xl font-semibold tabular-nums">{formatUsd(card.valueUi)}</p>
      <p className="text-sm text-white/55">
        Send {formatUsd(card.valueUi)} USDC on {card.payNetwork} to the creator. Then paste the transfer hash. The card
        moves to your profile. The Chapter coin, if paired, is a separate market.
      </p>
      <button type="button" onClick={() => void copyPay()} className="block w-full truncate rounded-2xl border border-white/10 px-3 py-3 font-mono text-xs text-white/70">
        {copied ? "Copied" : card.creatorPayAddress}
      </button>
      <Input value={tx} onChange={(e) => setTx(e.target.value)} placeholder="tx hash / signature" />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button type="button" onClick={() => void claim()} disabled={busy}>
        {busy ? "Moving jacket…" : "I paid · take card"}
      </Button>
    </div>
  );
}
