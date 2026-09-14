"use client";

import { useEffect, useState } from "react";
import { readApiJson } from "@/lib/http/read-json";
import { timeAgo } from "@/lib/format";

type Activity = {
  id: string;
  kind: string;
  detail: Record<string, unknown>;
  txSignature: string | null;
  createdAt: string;
};

const LABEL: Record<string, string> = {
  minted: "Press minted",
  offer_created: "Offer sent",
  offer_accepted: "Offer accepted",
  offer_declined: "Offer declined",
  offer_cancelled: "Offer cancelled",
  sale: "Sale settled",
  settlement_failed: "Settlement failed",
  payment_confirmed_transfer_pending: "Payment confirmed — NFT transfer pending",
};

export function Storyline({ slug }: { slug: string }) {
  const [rows, setRows] = useState<Activity[] | null>(null);

  useEffect(() => {
    let live = true;
    fetch(`/api/cards/${slug}/activity`, { cache: "no-store" })
      .then((res) => readApiJson<{ activity?: Activity[] }>(res))
      .then((body) => {
        if (live) setRows(body.activity ?? []);
      })
      .catch(() => {
        if (live) setRows([]);
      });
    return () => {
      live = false;
    };
  }, [slug]);

  if (!rows || !rows.length) return null;

  return (
    <div className="space-y-3 rounded-3xl border border-white/10 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">The story</p>
      <ol className="space-y-3">
        {rows.map((row) => (
          <li key={row.id} className="flex items-start justify-between gap-3 text-sm">
            <div>
              <p className="font-medium">{LABEL[row.kind] ?? row.kind}</p>
              <p className="text-xs text-white/40">{timeAgo(row.createdAt)}</p>
            </div>
            {row.txSignature ? (
              <a
                href={`https://solscan.io/tx/${row.txSignature}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 font-mono text-[11px] text-white/40 underline"
              >
                {row.txSignature.slice(0, 8)}…
              </a>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
