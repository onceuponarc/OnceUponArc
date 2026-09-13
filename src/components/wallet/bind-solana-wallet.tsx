"use client";

import { useState } from "react";
import { SOLANA } from "@onceupon/config/solana";
import { Button } from "@/components/ui/button";
import { SolanaConnectButton } from "@/components/wallet/connect-button";
import { useSolanaWallet } from "@/components/wallet/solana-wallet-provider";

export function BindSolanaWallet() {
  const { address, signMessage } = useSolanaWallet();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function verify() {
    if (!address) {
      setError("Connect a Solana wallet first.");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const issuedAt = new Date().toISOString();
      const me = await fetch("/api/me").then((r) => r.json());
      if (!me.id) {
        setError(me.error ?? "Sign in with X first.");
        return;
      }
      const message = `OnceUpon:${me.id}:${issuedAt}`;
      const signature = await signMessage(message);
      const res = await fetch("/api/wallets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          issuedAt,
          signature,
          chainCaip2: SOLANA.caip2,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Wallet verification failed.");
        return;
      }
      setStatus("Solana wallet bound to this OnceUponer.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not bind the wallet.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="glass space-y-3 rounded-2xl border border-gold/20 p-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">External wallet</p>
        <h2 className="font-heading text-xl font-bold">Bind Phantom / Solflare</h2>
        <p className="mt-1 text-sm text-parchment/65">
          Optional. Launches still sign with the pad wallet. Binding proves this Solana address is yours.
        </p>
      </div>
      <SolanaConnectButton />
      <p className="break-all text-sm text-parchment/70">Connected: {address ?? "none"}</p>
      <Button type="button" variant="secondary" onClick={() => void verify()} disabled={busy || !address}>
        {busy ? "Signing…" : "Sign OnceUpon:{user}:{time}"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {status ? <p className="text-sm text-gold">{status}</p> : null}
    </div>
  );
}
