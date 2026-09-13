"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SOLANA } from "@onceupon/config/solana";
import {
  canonicalPoolsForQuote,
  catalogFor,
  createLpLinks,
  type DexId,
} from "@onceupon/config/pools";
import { findQuote, findQuoteByMint } from "@onceupon/config/quotes";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PoolPicker, type LinkedPoolPick } from "@/components/launch/pool-picker";
import { readApiJson } from "@/lib/http/read-json";

export function LinkLp({
  slug,
  ticker,
  tokenMint,
  quoteMint,
  pairLabel,
  boundAddresses,
}: {
  slug: string;
  ticker: string;
  tokenMint: string | null;
  quoteMint: string | null;
  pairLabel: string;
  boundAddresses: string[];
}) {
  const router = useRouter();
  const listed = findQuoteByMint(quoteMint) ?? findQuote("sol");
  const quoteId = listed?.id ?? "sol";
  const quoteSymbol = listed?.symbol ?? pairLabel ?? "SOL";
  const canonical = canonicalPoolsForQuote(quoteId);
  const catalog = catalogFor("solana");
  const [pool, setPool] = useState<LinkedPoolPick | null>(
    canonical[0]
      ? {
          address: canonical[0].address,
          dex: canonical[0].dex,
          label: canonical[0].label,
          url: canonical[0].url,
          chain: "solana",
          depthUsd: canonical[0].liquidityUsd,
          quoteAddress: quoteMint,
        }
      : null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const lpLinks = useMemo(
    () => (tokenMint ? createLpLinks(tokenMint, quoteMint) : []),
    [tokenMint, quoteMint],
  );

  async function bind(pick: LinkedPoolPick) {
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/bindings/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storySlug: slug,
          chainCaip2: catalog.caip2,
          poolAddress: pick.address,
          mechanism: pick.dex,
          proofUrl: pick.url || undefined,
          depthUsd: pick.depthUsd,
          quoteAddress: pick.quoteAddress ?? quoteMint,
          label: pick.label,
        }),
      });
      const body = await readApiJson<{ error?: string; label?: string }>(res);
      if (!res.ok) {
        setError(body.error ?? "Could not bind that pool.");
        return;
      }
      setOk(`Bound ${body.label ?? pick.label}. Reload shows it on this Story.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not bind that pool.");
    } finally {
      setBusy(false);
    }
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
  }

  const already = new Set(boundAddresses.map((item) => item.toLowerCase()));
  const quoteDepthBound = canonical.some((item) => already.has(item.address.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-parchment/70">
        <p className="font-medium text-parchment">
          Quote is {quoteSymbol}
          {listed?.group === "stock" || listed?.group === "etf" ? " · quote pair, not studio equity" : ""}
        </p>
        <p className="mt-1">
          Launching against {quoteSymbol} does not put ${ticker} into the existing {quoteSymbol} LP. Bind that
          live depth here, then open a ${ticker}/{quoteSymbol} (or USDC) pool and paste the new pool address.
        </p>
        {tokenMint ? (
          <p className="mt-2 break-all font-mono text-[11px] text-parchment/50">Your mint · {tokenMint}</p>
        ) : (
          <p className="mt-2 text-burgundy">Mint is not on-chain yet. Finish sign-and-pay first.</p>
        )}
        {quoteMint ? (
          <p className="mt-1 break-all font-mono text-[11px] text-parchment/50">
            {quoteSymbol} mint · {quoteMint}
          </p>
        ) : (
          <p className="mt-1 break-all font-mono text-[11px] text-parchment/50">SOL mint · {SOLANA.wsolMint}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {tokenMint ? (
            <Button type="button" size="sm" variant="outline" onClick={() => void copy(tokenMint)}>
              Copy your mint
            </Button>
          ) : null}
          {quoteMint ? (
            <Button type="button" size="sm" variant="outline" onClick={() => void copy(quoteMint)}>
              Copy {quoteSymbol} mint
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={() => void copy(SOLANA.usdcMint)}>
            Copy USDC mint
          </Button>
        </div>
      </div>

      {canonical.length ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-parchment">1 · Bind quote depth</p>
          <p className="text-xs text-parchment/55">
            {canonical[0].label} on Raydium is the live {quoteSymbol} pool. Binding it tags this Story. It does
            not deposit your tokens.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{canonical[0].dex}</Badge>
            <span className="font-mono text-[11px] text-parchment/50">
              {canonical[0].address.slice(0, 6)}…{canonical[0].address.slice(-4)}
            </span>
            {quoteDepthBound ? (
              <Badge>Already bound</Badge>
            ) : (
              <Button
                type="button"
                size="sm"
                disabled={busy || !tokenMint}
                onClick={() =>
                  void bind({
                    address: canonical[0].address,
                    dex: canonical[0].dex as DexId,
                    label: canonical[0].label,
                    url: canonical[0].url,
                    chain: "solana",
                    depthUsd: canonical[0].liquidityUsd,
                    quoteAddress: quoteMint,
                  })
                }
              >
                {busy ? "Binding…" : `Bind ${canonical[0].label}`}
              </Button>
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium text-parchment">2 · Open your own LP</p>
        <p className="text-xs text-parchment/55">
          Create ${ticker}/{quoteSymbol} or ${ticker}/USDC on an AMM, then paste that pool below. You pay the
          liquidity. OnceUpon does not seed an empty pool.
        </p>
        <div className="flex flex-wrap gap-2">
          {lpLinks.map((link) => (
            <Button key={link.id} asChild size="sm" variant="outline">
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.name}
              </a>
            </Button>
          ))}
        </div>
      </div>

      <PoolPicker
        chain="solana"
        quoteId={quoteId}
        mint={quoteMint || ""}
        selected={pool}
        onSelect={setPool}
        heading="3 · Pick or paste a pool"
      />

      <Button type="button" disabled={busy || !pool?.address || !tokenMint} onClick={() => pool && void bind(pool)}>
        {busy ? "Binding…" : pool ? `Bind ${pool.label}` : "Pick a pool"}
      </Button>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Link blocked</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {ok ? (
        <Alert>
          <AlertTitle>Pool linked</AlertTitle>
          <AlertDescription>{ok}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
