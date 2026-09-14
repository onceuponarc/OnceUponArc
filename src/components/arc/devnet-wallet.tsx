"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatUsd, shortenAddress } from "@/lib/format";
import { readApiJson } from "@/lib/http/read-json";
import { cn } from "@/lib/utils";

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

async function loadStatus() {
  return readApiJson<Status>(await fetch("/api/arc/status"));
}

export function NetworkChip() {
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    loadStatus()
      .then(setStatus)
      .catch(() => setStatus({ ready: false }));
  }, []);
  const live = Boolean(status?.ready);
  const label = status == null ? "ARC" : status.chainId === 5042 || live ? "ARC" : "ARC";
  return <Linkish live={live} label={label} />;
}

function Linkish({ live, label }: { live: boolean; label: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
        live ? "border-white/20 text-white" : "border-white/10 text-white/40",
      )}
    >
      <span className={cn("size-1.5 rounded-full", live ? "bg-buy" : "bg-white/30")} />
      {label}
    </div>
  );
}

export function ArcDevnetWallet({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    const body = await loadStatus();
    setStatus(body);
  }

  useEffect(() => {
    refresh().catch(() => setStatus({ ready: false, error: "Could not reach Arc." }));
  }, []);

  async function faucet() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/arc/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: status?.address }),
      });
      const body = await readApiJson<{ error?: string }>(res);
      if (!res.ok) setError(body.error ?? "Faucet failed.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Faucet failed.");
    } finally {
      setBusy(false);
    }
  }

  if (compact) return <NetworkChip />;

  return (
    <section className="glass space-y-3 rounded-2xl border p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">Arc pad wallet</p>
          <h2 className="mt-1 text-xl font-semibold">{status?.ready ? "Arc live" : "Arc offline"}</h2>
        </div>
        <Badge variant={status?.ready ? "default" : "outline"}>{status?.ready ? "Ready" : "Offline"}</Badge>
      </div>
      {status?.note ? <p className="text-sm text-white/60">{status.note}</p> : null}
      {status?.address ? (
        <p className="font-mono text-xs text-white/55">{shortenAddress(status.address, 6)}</p>
      ) : null}
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-white/40">USDC</dt>
          <dd className="text-2xl font-semibold tabular-nums">
            {status?.usdcUi != null ? formatUsd(status.usdcUi) : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-white/40">Gas</dt>
          <dd className="text-2xl font-semibold tabular-nums">
            {status?.gasEth ? Number(status.gasEth).toFixed(2) : "—"} {status?.nativeGas === "usdc" ? "USDC" : "ETH"}
          </dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={faucet} disabled={busy || !status?.ready}>
          {busy ? "Minting…" : "Fund $500 test USDC"}
        </Button>
        <Button type="button" variant="outline" onClick={() => refresh()}>
          Refresh
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href="https://faucet.circle.com" target="_blank" rel="noreferrer">
            Circle faucet
          </a>
        </Button>
      </div>
      {status?.error || error ? (
        <Alert variant="destructive">
          <AlertTitle>Factory</AlertTitle>
          <AlertDescription>{error ?? status?.error}</AlertDescription>
        </Alert>
      ) : null}
    </section>
  );
}
