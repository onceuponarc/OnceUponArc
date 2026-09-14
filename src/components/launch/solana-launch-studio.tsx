"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CoverField, type CoverPick } from "@/components/launch/cover-field";
import { DevFundBanner } from "@/components/wallet/dev-fund-banner";
import { readApiJson } from "@/lib/http/read-json";
import { VANITY_SUFFIX } from "@/lib/solana/vanity";

export function SolanaLaunchStudio({ handle }: { handle: string | null }) {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [blurb, setBlurb] = useState("");
  const [devBuy, setDevBuy] = useState("0.01");
  const [cover, setCover] = useState<CoverPick | null>(null);
  const [vanity, setVanity] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ mint: string; signature?: string; explorer?: string } | null>(null);

  async function launch(event: React.FormEvent) {
    event.preventDefault();
    if (!handle) {
      setError("Sign in with X first.");
      return;
    }
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const built = await fetch("/api/solana/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          symbol,
          blurb,
          metadataUri: cover?.imageUri,
          coverUrl: cover?.url,
          devBuySol: Number(devBuy),
          vanity,
        }),
      });
      const body = await readApiJson<{
        error?: string;
        mint?: string;
        signature?: string;
        explorer?: string;
      }>(built);
      if (!built.ok || !body.mint) {
        throw new Error(body.error ?? "Fund your in-app Solana wallet with SOL, then retry.");
      }
      setResult({ mint: body.mint, signature: body.signature, explorer: body.explorer });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Launch failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void launch(event)} className="space-y-5 rounded-3xl border border-white/10 p-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Solana · pump.fun</p>
        <h2 className="mt-1 text-2xl font-semibold">Print on Solana</h2>
        <p className="mt-2 text-sm text-white/55">
          Your in-app Solana wallet is the dev wallet. Fund it with SOL. It pays gas, signs the mint, and collects
          fees. No Phantom.
        </p>
        <div className="mt-4">
          <DevFundBanner chain="solana" />
        </div>
      </div>
      <p className="text-sm text-white/50">Bonding curve on pump.fun. Buy and sell from create. Volume feeds the LP.</p>
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
        <Label>Blurb</Label>
        <Input className="mt-2" value={blurb} onChange={(e) => setBlurb(e.target.value)} />
      </div>
      <div>
        <Label>Dev buy (SOL)</Label>
        <Input className="mt-2" value={devBuy} onChange={(e) => setDevBuy(e.target.value)} />
      </div>
      <label className="flex items-center gap-2 text-sm text-white/70">
        <input type="checkbox" checked={vanity} onChange={(e) => setVanity(e.target.checked)} />
        Mine a …{VANITY_SUFFIX} mint
      </label>
      <Button type="submit" disabled={busy}>
        {busy ? "Signing with your desk…" : "Launch on pump.fun"}
      </Button>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {result ? (
        <p className="break-all text-sm text-white/70">
          Mint {result.mint}
          {result.signature ? ` · ${result.signature}` : ""} ·{" "}
          <a className="underline" href={result.explorer ?? `https://solscan.io/token/${result.mint}`} target="_blank" rel="noreferrer">
            explorer
          </a>
        </p>
      ) : null}
      <ClaimFees />
    </form>
  );
}

function ClaimFees() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function claim() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/solana/claim", { method: "POST" });
    const body = await readApiJson<{ error?: string; signature?: string; explorer?: string }>(res);
    setBusy(false);
    if (!res.ok || !body.signature) {
      setMsg(body.error ?? "Claim failed. Fund the in-app Solana wallet.");
      return;
    }
    setMsg(body.explorer ?? body.signature);
  }
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <p className="text-sm font-semibold">Claim pump.fun creator fees</p>
      <p className="mt-1 text-xs text-white/45">Pays out to your in-app Solana desk. No Phantom.</p>
      <Button type="button" className="mt-3" variant="outline" disabled={busy} onClick={() => void claim()}>
        {busy ? "Claiming…" : "Claim fees"}
      </Button>
      {msg ? <p className="mt-2 break-all text-xs text-white/50">{msg}</p> : null}
    </div>
  );
}
