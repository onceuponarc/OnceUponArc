"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SOLANA } from "@onceupon/config/solana";

type WalletInfo = {
  address: string;
  balance: number;
  explorer: string;
};

export function EmbeddedWalletCard() {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [secretArray, setSecretArray] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/wallets/embedded");
    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? "Could not load the pad wallet.");
      return;
    }
    setWallet({ address: body.address, balance: body.balance, explorer: body.explorer });
    setError(null);
  }

  useEffect(() => {
    load().catch(() => setError("Could not load the pad wallet."));
  }, []);

  async function airdrop() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/wallets/embedded", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "airdrop" }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Airdrop failed.");
        return;
      }
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function exportKeys() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/wallets/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Export failed.");
        return;
      }
      setSecret(body.secretBase58);
      setSecretArray(JSON.stringify(body.secretArray));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass space-y-4 rounded-2xl border border-gold/25 p-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">Pad wallet</p>
        <h2 className="font-heading mt-1 text-2xl font-bold">Solana · created with your X account</h2>
        <p className="mt-2 text-sm text-parchment/65">
          You can still connect an external wallet. This key is yours. Export it anytime. The pad never
          prints it in logs.
        </p>
      </div>
      {wallet ? (
        <div className="space-y-2 text-sm">
          <p className="break-all font-mono text-gold">{wallet.address}</p>
          <p>{wallet.balance.toFixed(4)} SOL on {SOLANA.name}</p>
          <a className="text-gold hover:underline" href={wallet.explorer} target="_blank" rel="noreferrer">
            Explorer
          </a>
        </div>
      ) : (
        <p className="text-sm text-parchment/60">Loading pad wallet…</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={airdrop} disabled={busy}>
          {busy ? "Working…" : "Airdrop 1 SOL"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href={SOLANA.faucet} target="_blank" rel="noreferrer">
            Open faucet
          </a>
        </Button>
        <Button type="button" variant="secondary" onClick={exportKeys} disabled={busy || !wallet}>
          Export secret key
        </Button>
      </div>
      {secret ? (
        <div className="space-y-2 rounded-xl border border-burgundy/40 bg-burgundy/10 p-3 text-xs">
          <p className="font-semibold text-parchment">This is the only time the pad shows the key. Copy it now.</p>
          <p className="break-all font-mono text-gold">{secret}</p>
          <p className="break-all font-mono text-parchment/70">{secretArray}</p>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(secret).catch(() => undefined);
            }}
          >
            Copy base58
          </Button>
        </div>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Wallet</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
