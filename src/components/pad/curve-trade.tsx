"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SolanaConnectButton } from "@/components/wallet/connect-button";
import { useWalletSigner } from "@/components/wallet/use-wallet-signer";

export function CurveTrade({
  slug,
  venue,
  engine,
  pairLabel,
  decimals,
  quoteDecimals = 9,
}: {
  slug: string;
  venue: string;
  engine: string;
  pairLabel: string;
  decimals: number;
  quoteDecimals?: number;
}) {
  const { address, signAndSend } = useWalletSigner();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState(pairLabel === "SOL" ? "0.1" : pairLabel.includes("USD") ? "10" : "0.25");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  if (venue === "nft") {
    return (
      <p className="text-sm text-parchment/70">
        This is an NFT mint. There is no bonding curve. The token lives on Solana at the address above.
      </p>
    );
  }

  async function submit(action: "buy" | "sell" | "claim") {
    if (!address) {
      setError("Connect a Solana wallet first.");
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/stories/${slug}/trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, amount: Number(amount), payer: address }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Trade failed.");
        return;
      }
      if (!body.transaction) {
        setError("The pad did not return a transaction to sign.");
        return;
      }
      const sent = await signAndSend(body.transaction);
      const confirm = await fetch(`/api/stories/${slug}/trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          side: action,
          amount: Number(amount),
          signature: sent.signature,
          payer: address,
        }),
      });
      const confirmed = await confirm.json();
      if (!confirm.ok) {
        setError(confirmed.error ?? "Trade landed but the pad could not record it.");
        setResult(sent.explorer);
        return;
      }
      setResult(confirmed.explorer ?? sent.explorer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trade failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-parchment/70">
        Quote is {pairLabel}. Curve fills settle from your connected Solana wallet. After this Story bonds, spot
        routes through Jupiter.
      </p>
      {!address ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-arc/20 bg-arc/5 px-3 py-2">
          <p className="text-sm text-parchment/70">Connect a wallet to buy, sell, or claim.</p>
          <SolanaConnectButton compact />
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button type="button" variant={side === "buy" ? "default" : "outline"} onClick={() => setSide("buy")}>
          Buy
        </Button>
        <Button type="button" variant={side === "sell" ? "default" : "outline"} onClick={() => setSide("sell")}>
          Sell
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amt">{side === "buy" ? `${pairLabel} in` : `Tokens in (decimals ${decimals})`}</Label>
        <Input id="amt" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy || !address} onClick={() => void submit(side)}>
          {busy ? "Sending…" : side === "buy" ? "Buy on the curve" : "Sell on the curve"}
        </Button>
        {engine === "onceuponers" ? (
          <Button type="button" variant="secondary" disabled={busy || !address} onClick={() => void submit("claim")}>
            Claim The Piece
          </Button>
        ) : null}
      </div>
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Trade blocked</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {result ? (
        <p className="text-sm">
          <a className="text-arc hover:underline" href={result} target="_blank" rel="noreferrer">
            View on explorer
          </a>
        </p>
      ) : null}
    </div>
  );
}
