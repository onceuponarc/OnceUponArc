"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readApiJson } from "@/lib/http/read-json";
import type { CardView } from "@/lib/cards/types";
import { formatUsd } from "@/lib/format";

type Offer = {
  id: string;
  cardSlug: string;
  buyerHandle: string;
  sellerHandle: string;
  offerAmountUi: number;
  status: string;
  txSignature: string | null;
  failReason: string | null;
  createdAt: string;
};

async function loadOffers(slug: string): Promise<Offer[]> {
  const res = await fetch(`/api/press/offers?card=${encodeURIComponent(slug)}`, { cache: "no-store" });
  const body = await readApiJson<{ offers?: Offer[] }>(res);
  return body.offers ?? [];
}

const TERMINAL = new Set(["completed", "declined", "expired", "cancelled", "failed"]);

/** Buyer-facing: send an offer for a card you don't own, and watch your own
 *  pending offers settle. Settlement is instant server-side once the seller
 *  accepts (both wallets are desk wallets OrbitX signs for), so this mostly
 *  just polls a couple of times rather than needing a real payment step. */
export function OfferDesk({ card, viewerHandle }: { card: CardView; viewerHandle: string | null }) {
  const router = useRouter();
  const [amount, setAmount] = useState(String(card.valueUi.toFixed(2)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mine, setMine] = useState<Offer[]>([]);

  async function refresh() {
    const offers = await loadOffers(card.slug);
    setMine(viewerHandle ? offers.filter((o) => o.buyerHandle.toLowerCase() === viewerHandle.toLowerCase()) : []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const id = window.setInterval(() => void refresh(), 4000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.slug, viewerHandle]);

  async function send() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/press/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardSlug: card.slug, offerAmountUi: Number(amount) }),
      });
      const body = await readApiJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(body.error ?? "Could not send the offer.");
      await refresh();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the offer.");
    } finally {
      setBusy(false);
    }
  }

  if (!card.listed) {
    return (
      <div className="rounded-3xl border border-white/10 p-5 text-sm text-white/55">
        This card is held by @{card.ownerHandle}. Not listed for offers right now.
      </div>
    );
  }

  const pending = mine.filter((o) => !TERMINAL.has(o.status));

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Request to buy</p>
      <p className="text-3xl font-semibold tabular-nums">{formatUsd(card.valueUi)}</p>
      <p className="text-sm text-white/55">
        Reference value only — send an offer and @{card.ownerHandle} can accept, decline, or ignore it. Settlement
        pays from your in-app desk wallet the instant it&rsquo;s accepted; no separate payment step.
      </p>
      <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Offer amount" />
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <Button type="button" onClick={() => void send()} disabled={busy}>
        {busy ? "Sending…" : "Send offer"}
      </Button>
      {pending.length ? (
        <div className="space-y-2 border-t border-white/10 pt-3">
          <p className="text-xs text-white/40">Your open offers</p>
          {pending.map((o) => (
            <div key={o.id} className="flex items-center justify-between text-sm">
              <span>{formatUsd(o.offerAmountUi)}</span>
              <span className="capitalize text-white/60">{o.status.replace(/_/g, " ")}</span>
            </div>
          ))}
        </div>
      ) : null}
      {mine.some((o) => o.status === "completed") ? (
        <p className="text-sm text-emerald-400">Settled — this card should now be on your profile.</p>
      ) : null}
      {mine.some((o) => o.status === "transfer_pending") ? (
        <p className="text-sm text-amber-400">Payment confirmed — NFT transfer is finishing up, refresh shortly.</p>
      ) : null}
    </div>
  );
}

/** Seller-facing inbox: accept/decline offers on a card you currently own. */
export function OfferInbox({ card }: { card: CardView }) {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const all = await loadOffers(card.slug);
    setOffers(all.filter((o) => o.status === "open"));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    const id = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card.slug]);

  async function respond(id: string, action: "accept" | "decline") {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/press/offers/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const body = await readApiJson<{ error?: string }>(res);
      if (!res.ok) throw new Error(body.error ?? "Could not update the offer.");
      await refresh();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update the offer.");
    } finally {
      setBusyId(null);
    }
  }

  if (!offers.length) {
    return <p className="text-sm text-white/45">No open offers yet.</p>;
  }

  return (
    <div className="space-y-3 rounded-3xl border border-white/10 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Offers on this card</p>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {offers.map((o) => (
        <div key={o.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 p-3">
          <div>
            <p className="font-semibold">{formatUsd(o.offerAmountUi)}</p>
            <p className="text-xs text-white/45">from @{o.buyerHandle}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" disabled={busyId === o.id} onClick={() => void respond(o.id, "accept")}>
              Accept
            </Button>
            <Button size="sm" variant="outline" disabled={busyId === o.id} onClick={() => void respond(o.id, "decline")}>
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
