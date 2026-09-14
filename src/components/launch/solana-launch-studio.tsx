"use client";

import { useState } from "react";
import { Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CoverField, type CoverPick } from "@/components/launch/cover-field";
import { useSolanaWallet } from "@/components/wallet/solana-wallet-provider";
import { readApiJson } from "@/lib/http/read-json";
import { VANITY_SUFFIX } from "@/lib/solana/vanity";

export function SolanaLaunchStudio({ handle }: { handle: string | null }) {
  const wallet = useSolanaWallet();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [blurb, setBlurb] = useState("");
  const [devBuy, setDevBuy] = useState("0.01");
  const [cover, setCover] = useState<CoverPick | null>(null);
  const [mode, setMode] = useState<"pump" | "tax">("tax");
  const [taxBps, setTaxBps] = useState("100");
  const [vanity, setVanity] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ mint: string; vanity: boolean; sig?: string } | null>(null);

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
      const publicKey = wallet.address || (await wallet.connect());
      if (!publicKey) throw new Error("Connect Phantom, Solflare, or Backpack.");
      const path = mode === "tax" ? "/api/solana/tax-launch" : "/api/solana/launch";
      const built = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          name,
          symbol,
          blurb,
          metadataUri: cover?.imageUri,
          coverUrl: cover?.url,
          devBuySol: Number(devBuy),
          vanity,
          taxBps: Number(taxBps),
        }),
      });
      const body = await readApiJson<{
        error?: string;
        transaction?: string;
        mint?: string;
        mintSecret?: string;
        vanity?: boolean;
      }>(built);
      if (!built.ok || !body.transaction || !body.mintSecret || !body.mint) {
        throw new Error(body.error ?? "Could not build the launch tx.");
      }
      const rawMint = body.mintSecret.match(/^[1-9A-HJ-NP-Za-km-z]+$/)
        ? bs58.decode(body.mintSecret)
        : Buffer.from(body.mintSecret, "base64");
      const mint = Keypair.fromSecretKey(Uint8Array.from(rawMint));
      let raw: Uint8Array;
      if (mode === "tax") {
        const tx = Transaction.from(Buffer.from(body.transaction, "base64"));
        tx.partialSign(mint);
        const signed = (await wallet.signTransaction(tx)) as Transaction;
        raw = signed.serialize();
      } else {
        const tx = VersionedTransaction.deserialize(Buffer.from(body.transaction, "base64"));
        tx.sign([mint]);
        const signed = (await wallet.signTransaction(tx)) as VersionedTransaction;
        raw = signed.serialize();
      }
      const send = await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "sendTransaction",
          params: [Buffer.from(raw).toString("base64"), { encoding: "base64", skipPreflight: true }],
        }),
      });
      const sent = (await send.json()) as { result?: string; error?: { message?: string } };
      if (!sent.result) throw new Error(sent.error?.message ?? "Send failed.");
      setResult({ mint: body.mint, vanity: Boolean(body.vanity), sig: sent.result });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Launch failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void launch(event)} className="space-y-5 rounded-3xl border border-white/10 p-5">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Solana</p>
        <h2 className="mt-1 text-2xl font-semibold">Print on Solana</h2>
        <p className="mt-2 text-sm text-white/55">
          Tax mint: Token-2022 cut on every transfer, including off-platform. Pump.fun: curve + Pump fees only.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant={mode === "tax" ? "default" : "outline"} onClick={() => setMode("tax")}>
            Tax mint
          </Button>
          <Button type="button" variant={mode === "pump" ? "default" : "outline"} onClick={() => setMode("pump")}>
            Pump.fun
          </Button>
        </div>
      </div>
      <CoverField value={cover} required onChange={setCover} />
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
      {mode === "pump" ? (
        <div>
          <Label>Dev buy (SOL)</Label>
          <Input className="mt-2" value={devBuy} onChange={(e) => setDevBuy(e.target.value)} />
        </div>
      ) : (
        <div>
          <Label>Platform tax (bps)</Label>
          <Input className="mt-2" value={taxBps} onChange={(e) => setTaxBps(e.target.value)} />
          <p className="mt-1 text-xs text-white/40">100 = 1%. Locked on the mint. Max 200.</p>
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-white/70">
        <input type="checkbox" checked={vanity} onChange={(e) => setVanity(e.target.checked)} />
        Mine a …{VANITY_SUFFIX} mint
      </label>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={() => void wallet.connect()}>
          {wallet.address ? `${wallet.address.slice(0, 4)}…${wallet.address.slice(-4)}` : "Connect Phantom"}
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Building…" : mode === "tax" ? "Launch taxed mint" : "Launch on pump.fun"}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {result ? (
        <p className="break-all text-sm text-white/70">
          {result.vanity ? "Vanity mint" : "Mint"} {result.mint}
          {result.sig ? ` · ${result.sig}` : ""} ·{" "}
          <a className="underline" href={`https://solscan.io/token/${result.mint}`} target="_blank" rel="noreferrer">
            solscan
          </a>
        </p>
      ) : null}
      <ClaimFees />
    </form>
  );
}

function ClaimFees() {
  const wallet = useSolanaWallet();
  const [msg, setMsg] = useState<string | null>(null);
  async function claim() {
    const publicKey = wallet.address || (await wallet.connect());
    if (!publicKey) return;
    const res = await fetch("/api/solana/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicKey }),
    });
    const body = await readApiJson<{ error?: string; transaction?: string }>(res);
    if (!res.ok || !body.transaction) {
      setMsg(body.error ?? "Claim failed.");
      return;
    }
    const tx = VersionedTransaction.deserialize(Buffer.from(body.transaction, "base64"));
    const signed = (await wallet.signTransaction(tx)) as VersionedTransaction;
    setMsg("Signed. Broadcast from your wallet if it did not auto-send.");
    void signed;
  }
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <p className="text-sm font-semibold">Claim pump.fun creator fees</p>
      <Button type="button" className="mt-3" variant="outline" onClick={() => void claim()}>
        Claim fees
      </Button>
      {msg ? <p className="mt-2 text-xs text-white/50">{msg}</p> : null}
    </div>
  );
}
