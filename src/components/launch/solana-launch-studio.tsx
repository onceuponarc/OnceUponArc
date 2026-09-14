"use client";

import { useState } from "react";
import { Keypair, Transaction, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CoverField, type CoverPick } from "@/components/launch/cover-field";
import { DevFundBanner } from "@/components/wallet/dev-fund-banner";
import { useSolanaWallet } from "@/components/wallet/solana-wallet-provider";
import { readApiJson } from "@/lib/http/read-json";
import { VANITY_SUFFIX } from "@/lib/solana/vanity";

type Mode = "direct" | "fair" | "pump";
type Program = "spl" | "token2022";

async function broadcast(raw: Uint8Array) {
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
  return sent.result;
}

export function SolanaLaunchStudio({ handle }: { handle: string | null }) {
  const wallet = useSolanaWallet();
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [blurb, setBlurb] = useState("");
  const [devBuy, setDevBuy] = useState("0.01");
  const [seedSol, setSeedSol] = useState("0.05");
  const [cover, setCover] = useState<CoverPick | null>(null);
  const mode: Mode = "pump";
  const [program, setProgram] = useState<Program>("token2022");
  const [taxBps, setTaxBps] = useState("100");
  const [vanity, setVanity] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ mint: string; vanity: boolean; sig?: string; poolSig?: string } | null>(null);

  async function signLegacy(transaction: string, mintSecret: string) {
    const rawMint = mintSecret.match(/^[1-9A-HJ-NP-Za-km-z]+$/) ? bs58.decode(mintSecret) : Buffer.from(mintSecret, "base64");
    const mint = Keypair.fromSecretKey(Uint8Array.from(rawMint));
    const tx = Transaction.from(Buffer.from(transaction, "base64"));
    tx.partialSign(mint);
    const signed = (await wallet.signTransaction(tx)) as Transaction;
    return signed.serialize();
  }

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

      if (mode === "pump") {
        const built = await fetch("/api/solana/launch", {
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
          throw new Error(body.error ?? "Could not build the pump.fun tx.");
        }
        const tx = VersionedTransaction.deserialize(Buffer.from(body.transaction, "base64"));
        const mint = Keypair.fromSecretKey(bs58.decode(body.mintSecret));
        tx.sign([mint]);
        const signed = (await wallet.signTransaction(tx)) as VersionedTransaction;
        const sig = await broadcast(signed.serialize());
        setResult({ mint: body.mint, vanity: Boolean(body.vanity), sig });
        return;
      }

      const built = await fetch("/api/solana/spot-launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicKey,
          name,
          symbol,
          program,
          mode,
          taxBps: program === "token2022" ? Number(taxBps) : 0,
          vanity,
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
        throw new Error(body.error ?? "Could not build the spot mint.");
      }
      const sig = await broadcast(await signLegacy(body.transaction, body.mintSecret));

      let poolSig: string | undefined;
      if (mode === "direct" && program === "spl") {
        await new Promise((resolve) => setTimeout(resolve, 2500));
        const pool = await fetch("/api/solana/spot-pool", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicKey, mint: body.mint, seedSol: Number(seedSol) }),
        });
        const poolBody = await readApiJson<{ error?: string; transaction?: string }>(pool);
        if (pool.ok && poolBody.transaction) {
          const poolTx = Transaction.from(Buffer.from(poolBody.transaction, "base64"));
          const signedPool = (await wallet.signTransaction(poolTx)) as Transaction;
          poolSig = await broadcast(signedPool.serialize());
        } else if (poolBody.error) {
          setError(`Mint live. Pool: ${poolBody.error}`);
        }
      }

      setResult({ mint: body.mint, vanity: Boolean(body.vanity), sig, poolSig });
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
          Fund your in-app Solana wallet with SOL. That key is the dev wallet: it pays gas, signs the mint, and
          collects fees. Phantom is optional. Pump.fun is the only bonding curve.
        </p>
        <div className="mt-4">
          <DevFundBanner chain="solana" />
        </div>

      </div>
      {mode !== "pump" ? (
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant={program === "spl" ? "default" : "outline"} onClick={() => setProgram("spl")}>
            SPL
          </Button>
          <Button type="button" variant={program === "token2022" ? "default" : "outline"} onClick={() => setProgram("token2022")}>
            Token-2022
          </Button>
        </div>
      ) : null}
      <p className="text-sm text-white/50">
        {mode === "pump"
          ? "Bonding curve on pump.fun. Only this lane uses a curve."
          : mode === "fair"
            ? "Same price window. Token-2022 accounts start frozen until you thaw. No curve."
            : "Tradable from the first book. SPL seeds a PumpSwap USDC/SOL pool. No curve."}
      </p>
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
      {mode === "pump" ? (
        <div>
          <Label>Dev buy (SOL)</Label>
          <Input className="mt-2" value={devBuy} onChange={(e) => setDevBuy(e.target.value)} />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {program === "token2022" ? (
            <div>
              <Label>Platform tax (bps)</Label>
              <Input className="mt-2" value={taxBps} onChange={(e) => setTaxBps(e.target.value)} />
            </div>
          ) : (
            <div>
              <Label>Seed book (SOL)</Label>
              <Input className="mt-2" value={seedSol} onChange={(e) => setSeedSol(e.target.value)} />
            </div>
          )}
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
          {busy ? "Building…" : mode === "pump" ? "Launch on pump.fun" : mode === "fair" ? "Fair launch spot" : "Direct launch spot"}
        </Button>
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {result ? (
        <p className="break-all text-sm text-white/70">
          Mint {result.mint}
          {result.sig ? ` · ${result.sig}` : ""}
          {result.poolSig ? ` · pool ${result.poolSig}` : ""} ·{" "}
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
