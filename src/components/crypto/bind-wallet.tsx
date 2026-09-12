"use client";

import { OnceUponConnectButton } from "@/components/crypto/connect";
import { useActiveAccount } from "thirdweb/react";
import { Button } from "@/components/ui/button";
import { ARC_TESTNET } from "@onceupon/config/arc";
import { useState } from "react";

export function BindArcWallet({
  verifiedAt,
  primaryWallet,
}: {
  verifiedAt: string | null;
  primaryWallet: string | null;
}) {
  const account = useActiveAccount();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function verify() {
    if (!account) {
      setError("Connect an Arc wallet first.");
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
      const signature = await account.signMessage({ message });
      const res = await fetch("/api/wallets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: account.address,
          issuedAt,
          signature,
          chainCaip2: ARC_TESTNET.caip2,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Wallet verification failed.");
        return;
      }
      setStatus("Arc wallet bound. You may draft a Story.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <OnceUponConnectButton />
      <p className="break-all text-sm text-parchment/70">
        Connected: {account?.address ?? "none"}
      </p>
      <p className="break-all text-sm text-parchment/70">
        Primary on your profile: {primaryWallet ?? "none yet"}
      </p>
      {verifiedAt ? (
        <p className="text-xs text-gold">Last bound {verifiedAt}</p>
      ) : null}
      <Button type="button" variant="secondary" onClick={verify} disabled={busy || !account}>
        {busy ? "Signing…" : "Sign OnceUpon:{user}:{time}"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {status ? <p className="text-sm text-gold">{status}</p> : null}
    </div>
  );
}
