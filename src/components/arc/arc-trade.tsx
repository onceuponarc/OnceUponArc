"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { readApiJson } from "@/lib/http/read-json";
import { formatCompact, formatUsd } from "@/lib/format";

export function ArcTrade({
  slug,
  pairLabel = "USDC",
}: {
  slug: string;
  pairLabel?: string;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("25");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [quote, setQuote] = useState<string | null>(null);
  const [tokenUi, setTokenUi] = useState<number | null>(null);
  const [usdcUi, setUsdcUi] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  async function refresh() {
    const res = await fetch(`/api/arc/stories?slug=${encodeURIComponent(slug)}`);
    const body = await readApiJson<{
      onchain?: { tokenUi?: number; usdcUi?: number; progressBps?: number };
    }>(res);
    setTokenUi(body.onchain?.tokenUi ?? null);
    setUsdcUi(body.onchain?.usdcUi ?? null);
    setProgress(body.onchain?.progressBps ?? null);
  }

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [slug]);

  async function preview() {
    const res = await fetch("/api/arc/trade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, side, amount: Number(amount), quote: true }),
    });
    const body = await readApiJson<{
      error?: string;
      baseOutUi?: number;
      quoteOutUi?: number;
      feeUi?: number;
    }>(res);
    if (!res.ok) {
      setQuote(body.error ?? "Quote failed.");
      return;
    }
    if (side === "buy") {
      setQuote(`≈ ${formatCompact(body.baseOutUi ?? 0)} tokens · fee ${formatUsd(body.feeUi ?? 0)}`);
    } else {
      setQuote(`≈ ${formatUsd(body.quoteOutUi ?? 0)} ${pairLabel} · fee ${formatUsd(body.feeUi ?? 0)}`);
    }
  }

  async function submit() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/arc/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, side, amount: Number(amount) }),
      });
      const body = await readApiJson<{ error?: string; hash?: string; priceUsd?: number }>(res);
      if (!res.ok) {
        setError(body.error ?? "Trade failed.");
        return;
      }
      setResult(`Landed ${body.hash?.slice(0, 10)}… · ${formatUsd(body.priceUsd ?? 0, 6)} / token`);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trade failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button type="button" variant={side === "buy" ? "default" : "outline"} onClick={() => setSide("buy")}>
          Buy
        </Button>
        <Button type="button" variant={side === "sell" ? "default" : "outline"} onClick={() => setSide("sell")}>
          Sell
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="arc-amt">{side === "buy" ? `${pairLabel} in` : "Tokens in"}</Label>
        <Input id="arc-amt" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      {progress != null ? (
        <div>
          <div className="mb-1 flex justify-between text-[11px] uppercase tracking-wide text-parchment/50">
            <span>Graduation</span>
            <span>{(progress / 100).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-arc" style={{ width: `${Math.min(100, progress / 100)}%` }} />
          </div>
        </div>
      ) : null}
      <p className="text-xs text-parchment/55">
        Test wallet {usdcUi != null ? `${formatUsd(usdcUi)} USDC` : ""}
        {tokenUi != null ? ` · ${formatCompact(tokenUi)} tokens` : ""}. Your USDC stays in the book until graduation.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={submit} disabled={busy} className="rounded-full">
          {busy ? "Signing on Arc…" : side === "buy" ? "Buy on Arc" : "Sell on Arc"}
        </Button>
        <Button type="button" variant="outline" onClick={preview} className="rounded-full">
          Quote
        </Button>
      </div>
      {quote ? <p className="text-sm text-arc">{quote}</p> : null}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Trade blocked</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {result ? (
        <Alert>
          <AlertTitle>Filled</AlertTitle>
          <AlertDescription>{result}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
