"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ARC_NETWORKS,
  importKey,
  makeKey,
  readArcKeys,
  writeArcKeys,
  type ArcKeypair,
} from "@/lib/arc/keys";
import { readApiJson } from "@/lib/http/read-json";
import { shortenAddress } from "@/lib/format";

type Store = { devnet: ArcKeypair | null; mainnet: ArcKeypair | null };

async function addNetwork(id: keyof typeof ARC_NETWORKS) {
  const eth = (window as Window & { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } })
    .ethereum;
  if (!eth) throw new Error("Install MetaMask, Rabby, Rainbow, or Coinbase Wallet.");
  const net = ARC_NETWORKS[id];
  try {
    await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: net.chainId }] });
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? Number((error as { code: number }).code) : 0;
    if (code === 4902) {
      await eth.request({ method: "wallet_addEthereumChain", params: [net] });
      return;
    }
    throw error instanceof Error ? error : new Error("Wallet rejected the network.");
  }
}

function KeyCard({
  title,
  pair,
  importValue,
  onImportValue,
  onGenerate,
  onImport,
  onFund,
  funding,
  hint,
}: {
  title: string;
  pair: ArcKeypair | null;
  importValue: string;
  onImportValue: (value: string) => void;
  onGenerate: () => void;
  onImport: () => void;
  onFund?: () => void;
  funding?: boolean;
  hint: string;
}) {
  const [reveal, setReveal] = useState(false);
  return (
    <section className="rounded-2xl border border-white/10 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">{title}</p>
      <p className="mt-2 text-sm text-white/55">{hint}</p>
      {pair ? (
        <div className="mt-4 space-y-2">
          <p className="font-mono text-sm text-white">{shortenAddress(pair.address, 8)}</p>
          <p className="break-all font-mono text-[11px] text-white/50">
            {reveal ? pair.privateKey : "0x••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setReveal((v) => !v)}>
              {reveal ? "Hide key" : "Show key"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void navigator.clipboard.writeText(pair.privateKey)}
            >
              Copy key
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void navigator.clipboard.writeText(pair.address)}
            >
              Copy address
            </Button>
            {onFund ? (
              <Button type="button" size="sm" onClick={onFund} disabled={funding}>
                {funding ? "Funding…" : "Fund Devnet"}
              </Button>
            ) : null}
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-white/45">No key yet. Generate one or paste a private key.</p>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Input value={importValue} onChange={(e) => onImportValue(e.target.value)} placeholder="0x private key" />
        <Button type="button" variant="outline" onClick={onImport}>
          Import
        </Button>
        <Button type="button" onClick={onGenerate}>
          Generate
        </Button>
      </div>
    </section>
  );
}

export function ArcWalletDesk() {
  const [keys, setKeys] = useState<Store>({ devnet: null, mainnet: null });
  const [devImport, setDevImport] = useState("");
  const [mainImport, setMainImport] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [funding, setFunding] = useState(false);

  useEffect(() => {
    setKeys(readArcKeys());
  }, []);

  function persist(next: Store) {
    writeArcKeys(next);
    setKeys(next);
  }

  async function fundDevnet() {
    if (!keys.devnet) return;
    setFunding(true);
    setError(null);
    try {
      const res = await fetch("/api/arc/faucet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: keys.devnet.address }),
      });
      const body = await readApiJson<{ error?: string; usdcUi?: number }>(res);
      if (!res.ok) throw new Error(body.error ?? "Faucet failed.");
      setNote("Devnet wallet funded with ETH + USDC.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Faucet failed.");
    } finally {
      setFunding(false);
    }
  }

  return (
    <div className="space-y-4">
      <KeyCard
        title="Arc Devnet key"
        pair={keys.devnet}
        importValue={devImport}
        onImportValue={setDevImport}
        hint="Local Anvil (chain 31337). Import this key into MetaMask, then add Arc Devnet. Fund it here to trade."
        onGenerate={() => persist({ ...keys, devnet: makeKey("devnet") })}
        onImport={() => {
          try {
            persist({ ...keys, devnet: importKey("devnet", devImport) });
            setDevImport("");
            setError(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Import failed.");
          }
        }}
        onFund={() => void fundDevnet()}
        funding={funding}
      />
      <KeyCard
        title="Arc Mainnet key"
        pair={keys.mainnet}
        importValue={mainImport}
        onImportValue={setMainImport}
        hint="Separate key for live Arc. Mainnet RPC is not public yet — keep this key offline until cutover. Never reuse the Devnet key."
        onGenerate={() => persist({ ...keys, mainnet: makeKey("mainnet") })}
        onImport={() => {
          try {
            persist({ ...keys, mainnet: importKey("mainnet", mainImport) });
            setMainImport("");
            setError(null);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Import failed.");
          }
        }}
      />
      <section className="rounded-2xl border border-white/10 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Wallet apps</p>
        <p className="mt-2 text-sm text-white/60">
          Arc is EVM. Import the hex key into MetaMask, Rabby, Rainbow, or Coinbase Wallet (Account menu → Import account
          → Private key). Then add the network.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void addNetwork("devnet").catch((err) => setError(err.message))}>
            Add Devnet to wallet
          </Button>
          <Button type="button" variant="outline" onClick={() => void addNetwork("testnet").catch((err) => setError(err.message))}>
            Add Arc Testnet
          </Button>
          <Button asChild variant="outline">
            <a href="https://metamask.io/download" target="_blank" rel="noreferrer">
              MetaMask
            </a>
          </Button>
          <Button asChild variant="outline">
            <a href="https://rabby.io" target="_blank" rel="noreferrer">
              Rabby
            </a>
          </Button>
        </div>
      </section>
      {note ? (
        <Alert>
          <AlertTitle>Funded</AlertTitle>
          <AlertDescription>{note}</AlertDescription>
        </Alert>
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
