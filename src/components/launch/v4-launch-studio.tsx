"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CoverField, type CoverPick } from "@/components/launch/cover-field";
import { DevFundBanner } from "@/components/wallet/dev-fund-banner";
import { readApiJson } from "@/lib/http/read-json";
import { LaunchLiveCard, type LiveLaunch } from "@/components/launch/launch-live-card";

type Mode = "direct" | "fair";

export function V4LaunchStudio({ handle }: { handle: string | null }) {
  const mode: Mode = "direct";
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [xHandle, setXHandle] = useState(handle ? `@${handle}` : "");
  const [cover, setCover] = useState<CoverPick | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LiveLaunch | null>(null);

  async function launch(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/arc/v4-launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          symbol,
          mode,
          coverUrl: cover?.url,
          xHandle,
        }),
      });
      const body = await readApiJson<{ error?: string; hash?: string; creator?: string; token?: string }>(res);
      if (!res.ok || !body.hash) throw new Error(body.error ?? "V4 launch failed. Fund your in-app Arc wallet with USDC.");
      setResult({
        venue: "uniswap-v4",
        name,
        symbol: symbol.toUpperCase(),
        blurb: xHandle,
        image: cover?.url ?? null,
        mint: body.token || body.creator || body.hash,
        signature: body.hash,
        creator: body.creator,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "V4 launch failed.");
    } finally {
      setBusy(false);
    }
  }

  if (result) {
    return <LaunchLiveCard live={result} onAgain={() => setResult(null)} />;
  }

  return (
    <form onSubmit={(event) => void launch(event)} className="space-y-5 rounded-3xl border border-white/10 p-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Arc · Uniswap v4</p>
        <h2 className="mt-1 text-2xl font-semibold">V4 launch desk</h2>
        <p className="mt-2 text-sm text-white/55">
          Your in-app wallet is the dev wallet. Fund it with USDC on Arc. It pays gas, signs the print, and receives
          trading fees. No MetaMask.
        </p>
      </div>
      <DevFundBanner chain="arc" />
      <CoverField value={cover} onChange={setCover} />
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input className="mt-2" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Ticker</Label>
          <Input className="mt-2" value={symbol} onChange={(e) => setSymbol(e.target.value)} required />
        </div>
      </div>
      <div>
        <Label>X handle label</Label>
        <Input className="mt-2" value={xHandle} onChange={(e) => setXHandle(e.target.value)} placeholder="@handle" />
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Signing with your desk…" : "Launch on Uniswap v4"}
      </Button>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </form>
  );
}
