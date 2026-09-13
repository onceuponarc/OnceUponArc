"use client";

import { useEffect, useState } from "react";
import type { LaunchChain } from "@onceupon/config/solana";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PoolResolveResult, ResolvedPool } from "@/lib/pools/resolve";

export type LinkedPoolPick = {
  address: string;
  dex: string;
  label: string;
  url: string;
  chain: LaunchChain;
  depthUsd: number;
  quoteAddress: string | null;
};

export function PoolPicker({
  chain,
  quoteId,
  mint,
  venue,
  selected,
  onSelect,
}: {
  chain: LaunchChain;
  quoteId: string;
  mint: string;
  venue?: string;
  selected: LinkedPoolPick | null;
  onSelect: (pool: LinkedPoolPick | null) => void;
}) {
  const [data, setData] = useState<PoolResolveResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    setError(null);
    const params = new URLSearchParams({ chain, quoteId });
    if (mint) params.set("mint", mint);
    if (venue) params.set("venue", venue);
    fetch(`/api/pools/resolve?${params.toString()}`)
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return;
        if (body.error) {
          setError(body.error);
          return;
        }
        setData(body as PoolResolveResult);
        const prefer = venue === "pumpfun" ? "pumpswap" : venue === "pons" ? "pons" : null;
        const linked = (body.linked as ResolvedPool[] | undefined) ?? [];
        const dest = (body.destination as ResolvedPool[] | undefined) ?? [];
        const first =
          (prefer ? linked.find((pool) => pool.dex === prefer) : undefined) ??
          dest[0] ??
          linked[0];
        if (first) {
          onSelect({
            address: first.address,
            dex: first.dex,
            label: first.label,
            url: first.url,
            chain: first.chain,
            depthUsd: first.liquidityUsd,
            quoteAddress: first.quoteAddress,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load live pools.");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
    // Auto-pick the deepest (or PumpSwap) pool whenever the quote, chain, or venue changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, quoteId, mint, venue]);

  const prefer = venue === "pumpfun" ? "pumpswap" : venue === "pons" ? "pons" : null;
  const pools = [
    ...(data?.linked ?? []).map((pool) => ({ ...pool, lane: "Solana depth" })),
    ...(data?.destination ?? []).map((pool) => ({ ...pool, lane: `${data?.chain} destination` })),
  ].sort((a, b) => {
    if (!prefer) return 0;
    const ap = a.dex === prefer ? 1 : 0;
    const bp = b.dex === prefer ? 1 : 0;
    return bp - ap;
  });

  return (
    <section className="glass rounded-2xl border border-arc/20 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">3b · Link a live pool</p>
      <p className="mt-2 text-sm text-parchment/65">
        {data?.launchPool.note ??
          (venue === "pumpfun"
            ? "PumpSwap venue pairs a PumpSwap pool as the linked AMM. The mint is still a full SPL token on OnceUpon."
            : "Your token opens as a full SPL mint on an OnceUpon launch pool against this quote. Pick the deep pool to attach — Raydium, Orca, PumpSwap, Uniswap, Aerodrome, Pons, or paste any pool.")}
      </p>
      {data ? (
        <p className="mt-2 text-xs text-parchment/45">
          Factories: {data.factories.map((item) => item.name).join(" · ") || "OnceUpon curve"}
        </p>
      ) : null}

      {busy ? <p className="mt-4 text-sm text-parchment/55">Reading live pools…</p> : null}
      {error ? <p className="mt-4 text-sm text-burgundy">{error}</p> : null}

      <div className="mt-4 grid max-h-80 gap-2 overflow-y-auto">
        {pools.map((pool) => {
          const active = selected?.address === pool.address;
          return (
            <button
              key={`${pool.chain}-${pool.address}`}
              type="button"
              onClick={() =>
                onSelect({
                  address: pool.address,
                  dex: pool.dex,
                  label: pool.label,
                  url: pool.url,
                  chain: pool.chain,
                  depthUsd: pool.liquidityUsd,
                  quoteAddress: pool.quoteAddress,
                })
              }
              className={cn(
                "rounded-xl border p-3 text-left transition",
                active ? "border-arc bg-arc/15" : "border-white/10 bg-white/5",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-heading font-bold">{pool.label}</p>
                <div className="flex gap-1">
                  <Badge variant="secondary">{pool.dex}</Badge>
                  <Badge variant="outline">{pool.lane}</Badge>
                </div>
              </div>
              <p className="mt-1 break-all font-mono text-[11px] text-parchment/50">{pool.address}</p>
              <p className="mt-1 text-xs text-parchment/55">
                {pool.liquidityUsd
                  ? `$${pool.liquidityUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })} depth`
                  : "Live venue"}
              </p>
            </button>
          );
        })}
      </div>

      {!busy && !pools.length ? (
        <p className="mt-3 text-sm text-parchment/60">
          No catalog pool matched. Paste any pool address — Raydium, Orca, Uniswap pair, or a mint’s AMM.
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        <Label htmlFor="pool">Or paste a pool</Label>
        <Input
          id="pool"
          value={custom}
          onChange={(e) => {
            const value = e.target.value.trim();
            setCustom(e.target.value);
            if (value.length >= 32) {
              onSelect({
                address: value,
                dex: "custom",
                label: "Custom pool",
                url: "",
                chain,
                depthUsd: 0,
                quoteAddress: mint || null,
              });
            }
          }}
          placeholder="Solana pool pubkey or 0x pair"
        />
      </div>
    </section>
  );
}
