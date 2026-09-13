"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatUsd, shortenAddress } from "@/lib/format";
import { readApiJson } from "@/lib/http/read-json";

type Status = {
  ready?: boolean;
  label?: string;
  chainId?: number;
  address?: string;
  usdcUi?: number;
  gasEth?: string;
  factory?: string;
  usdc?: string;
  note?: string;
  error?: string;
  nativeGas?: string;
};

export function ArcDevnetWallet({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const body = await readApiJson<Status>(await fetch("/api/arc/status"));
    setStatus(body);
  }

  useEffect(() => {
    refresh().catch(() => setStatus({ ready: false, error: "Could not reach Arc Devnet." }));
  }, []);

  async function faucet() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/arc/faucet", { method: "POST" });
      const body = await readApiJson<{ error?: string }>(res);
      if (!res.ok) setError(body.error ?? "Faucet failed.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Faucet failed.");
    } finally {
      setBusy(false);
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-arc/25 bg-arc/10 px-2.5 py-1 text-[11px]">
        <span className="size-1.5 rounded-full bg-buy" />
        <span className="hidden sm:inline">{status?.label ?? "Arc"}</span>
        <span className="tabular-nums text-parchment/80">
          {status?.usdcUi != null ? formatUsd(status.usdcUi) : "…"}
        </span>
      </div>
    );
  }

  return (
    <section className="glass space-y-3 rounded-2xl border border-arc/25 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">Arc test wallet</p>
          <h2 className="font-heading text-xl font-bold">{status?.label ?? "Arc Devnet"}</h2>
        </div>
        <Badge variant={status?.ready ? "default" : "outline"}>{status?.ready ? "Funded" : "Offline"}</Badge>
      </div>
      {status?.note ? <p className="text-sm text-parchment/65">{status.note}</p> : null}
      {status?.address ? (
        <p className="font-mono text-xs text-parchment/70">{shortenAddress(status.address, 6)}</p>
      ) : null}
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-parchment/45">USDC</dt>
          <dd className="font-heading text-2xl font-bold tabular-nums">
            {status?.usdcUi != null ? formatUsd(status.usdcUi) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-parchment/45">Gas</dt>
          <dd className="font-heading text-2xl font-bold tabular-nums">
            {status?.gasEth ? Number(status.gasEth).toFixed(2) : "—"} {status?.nativeGas === "usdc" ? "USDC" : "ETH"}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={faucet} disabled={busy || !status?.ready} className="rounded-full">
          {busy ? "Minting…" : "Drip 25,000 test USDC"}
        </Button>
        <Button type="button" variant="outline" onClick={() => refresh()} className="rounded-full">
          Refresh
        </Button>
      </div>
      {status?.error || error ? (
        <Alert variant="destructive">
          <AlertTitle>Devnet</AlertTitle>
          <AlertDescription>{error ?? status?.error}</AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}
