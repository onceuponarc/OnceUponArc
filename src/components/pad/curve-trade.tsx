"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function CurveTrade({
  slug,
  venue,
  engine,
  pairLabel,
  decimals,
}: {
  slug: string;
  venue: string;
  engine: string;
  pairLabel: string;
  decimals: number;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("0.1");
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
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/stories/${slug}/trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, amount: Number(amount) }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Trade failed.");
        return;
      }
      setResult(body.explorer ?? "Confirmed on Solana.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-parchment/70">
        Quote is {pairLabel}. Buys and sells settle on Solana devnet from your pad wallet.
      </p>
      <div className="flex gap-2">
        <Button type="button" variant={side === "buy" ? "default" : "outline"} onClick={() => setSide("buy")}>
          Buy
        </Button>
        <Button type="button" variant={side === "sell" ? "default" : "outline"} onClick={() => setSide("sell")}>
          Sell
        </Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amt">{side === "buy" ? "SOL in" : `Tokens out (decimals ${decimals})`}</Label>
        <Input id="amt" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy} onClick={() => submit(side)}>
          {busy ? "Sending…" : side === "buy" ? "Buy on the curve" : "Sell on the curve"}
        </Button>
        {engine === "onceuponers" ? (
          <Button type="button" variant="secondary" disabled={busy} onClick={() => submit("claim")}>
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
          <a className="text-gold hover:underline" href={result} target="_blank" rel="noreferrer">
            View on explorer
          </a>
        </p>
      ) : null}
    </div>
  );
}
