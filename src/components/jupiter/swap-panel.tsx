"use client";

import { useMemo, useState } from "react";
import { VersionedTransaction } from "@solana/web3.js";
import { JUPITER, SOLANA } from "@onceupon/config/solana";
import { QUOTE_ASSETS } from "@onceupon/config/quotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useSolanaWallet } from "@/components/wallet/solana-wallet-provider";
import { SolanaConnectButton } from "@/components/wallet/connect-button";
import type { JupiterQuote } from "@/lib/jupiter";
import { cn } from "@/lib/utils";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const SWAP_TOKENS = [
  { symbol: "SOL", mint: SOLANA.wsolMint, decimals: 9 },
  { symbol: "USDC", mint: SOLANA.usdcMint, decimals: 6 },
  ...QUOTE_ASSETS.filter((item) => item.mint && ["usdt", "pyusd", "aaplx", "tslax", "nvdax"].includes(item.id)).map(
    (item) => ({ symbol: item.symbol, mint: item.mint as string, decimals: item.decimals }),
  ),
];

function formatAmount(raw: string, decimals: number) {
  const value = Number(raw) / 10 ** decimals;
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", { maximumFractionDigits: decimals > 6 ? 6 : 4 });
}

export function JupiterSwapPanel({
  title = "Jupiter route",
}: {
  title?: string;
}) {
  const { address, signTransaction } = useSolanaWallet();
  const [inputSymbol, setInputSymbol] = useState("SOL");
  const [outputSymbol, setOutputSymbol] = useState("USDC");
  const [amount, setAmount] = useState("0.1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [quote, setQuote] = useState<JupiterQuote | null>(null);
  const [rawQuote, setRawQuote] = useState<Record<string, unknown> | null>(null);

  const input = SWAP_TOKENS.find((item) => item.symbol === inputSymbol) ?? SWAP_TOKENS[0];
  const output = SWAP_TOKENS.find((item) => item.symbol === outputSymbol) ?? SWAP_TOKENS[1];
  const hops = quote?.hops ?? [];

  const rawAmount = useMemo(() => {
    const ui = Number(amount);
    if (!Number.isFinite(ui) || ui <= 0) return "";
    return BigInt(Math.round(ui * 10 ** input.decimals)).toString();
  }, [amount, input.decimals]);

  async function loadQuote() {
    if (!rawAmount) {
      setError("Enter an amount.");
      return;
    }
    if (input.mint === output.mint) {
      setError("Pick two different tokens.");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(
        `/api/jupiter/quote?inputMint=${input.mint}&outputMint=${output.mint}&amount=${rawAmount}&slippageBps=50`,
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "No Jupiter route.");
      setQuote(body.quote as JupiterQuote);
      setRawQuote(body.raw as Record<string, unknown>);
    } catch (err) {
      setQuote(null);
      setRawQuote(null);
      setError(err instanceof Error ? err.message : "Jupiter quote failed.");
    } finally {
      setBusy(false);
    }
  }

  async function swap() {
    if (!address) {
      setError("Connect a Solana wallet to sign the Jupiter swap.");
      return;
    }
    if (!rawQuote) {
      setError("Get a route first.");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const built = await fetch("/api/jupiter/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPublicKey: address, quoteResponse: rawQuote }),
      });
      const swapBody = await built.json();
      if (!built.ok) throw new Error(swapBody.error ?? "Jupiter could not build the swap.");
      const tx = VersionedTransaction.deserialize(base64ToBytes(swapBody.swapTransaction as string));
      const signed = await signTransaction(tx);
      const sent = await fetch("/api/solana/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedTx: bytesToBase64(signed.serialize()) }),
      });
      const result = await sent.json();
      if (!sent.ok) throw new Error(result.error ?? "The swap did not land.");
      setStatus(`Landed ${result.signature}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Swap failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="glass space-y-4 rounded-2xl border border-gold/20 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">{title}</p>
          <h2 className="font-heading text-xl font-bold">Route through Jupiter</h2>
          <p className="mt-1 text-sm text-parchment/65">
            Quotes come from Jupiter Metis. You sign the swap in your wallet. OnceUpon does not custody the route.
          </p>
        </div>
        <SolanaConnectButton />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label>From</Label>
          <select
            value={inputSymbol}
            onChange={(e) => setInputSymbol(e.target.value)}
            className="h-8 w-full rounded-lg border border-gold/25 bg-ink/60 px-2 text-sm"
          >
            {SWAP_TOKENS.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>To</Label>
          <select
            value={outputSymbol}
            onChange={(e) => setOutputSymbol(e.target.value)}
            className="h-8 w-full rounded-lg border border-gold/25 bg-ink/60 px-2 text-sm"
          >
            {SWAP_TOKENS.map((token) => (
              <option key={token.symbol} value={token.symbol}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Amount</Label>
          <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void loadQuote()} disabled={busy}>
          {busy && !quote ? "Routing…" : "Get Jupiter route"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => void swap()} disabled={busy || !quote || !address}>
          {address ? "Sign swap" : "Connect to swap"}
        </Button>
        <Button type="button" variant="ghost" asChild>
          <a href={JUPITER.app} target="_blank" rel="noreferrer">
            Open jup.ag
          </a>
        </Button>
      </div>

      {quote ? (
        <div className="rounded-xl border border-gold/15 bg-black/20 p-3 text-sm">
          <p className="text-parchment">
            {formatAmount(quote.inAmount, input.decimals)} {input.symbol} →{" "}
            {formatAmount(quote.outAmount, output.decimals)} {output.symbol}
          </p>
          <p className="mt-1 text-xs text-parchment/55">
            Impact {Number(quote.priceImpactPct).toFixed(3)}% · slippage {(quote.slippageBps / 100).toFixed(2)}%
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {hops.length ? (
              hops.map((hop, index) => (
                <Badge key={`${hop.label}-${index}`} variant="outline" className={cn("text-[11px]")}>
                  {hop.label}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">Direct</Badge>
            )}
          </div>
        </div>
      ) : null}

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Route blocked</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {status ? (
        <Alert>
          <AlertTitle>Swap sent</AlertTitle>
          <AlertDescription className="break-all">{status}</AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}
