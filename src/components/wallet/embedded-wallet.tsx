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
  const [copied, setCopied] = useState(false);

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

  async function copyAddress() {
    if (!wallet) return;
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy the address.");
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
          This key is yours on {SOLANA.name}. Export it anytime. The pad never prints it in logs. Send real
          SOL here before you launch or trade — there is no faucet.
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
        <Button type="button" onClick={copyAddress} disabled={!wallet}>
          {copied ? "Copied" : "Copy address"}
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
