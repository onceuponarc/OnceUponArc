"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { readApiJson } from "@/lib/http/read-json";

type Desk = {
  wallets: { solana: string | null; eth: string | null; rh: string | null; arc?: string | null };
  explorers: { solana: string | null; eth: string | null; rh: string | null };
};

const CHAINS = [
  { id: "solana", label: "Solana · send SOL here to launch" },
  { id: "eth", label: "Arc + ETH · send Arc USDC here to launch" },
  { id: "rh", label: "Robinhood Chain" },
] as const;

export function WalletDesk() {
  const [desk, setDesk] = useState<Desk | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [secret, setSecret] = useState("");
  const [shown, setShown] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/wallets/desk", { cache: "no-store" });
    const body = await readApiJson<Desk & { error?: string }>(res);
    if (!res.ok) throw new Error(body.error ?? "Desk failed.");
    setDesk(body);
  }

  useEffect(() => {
    load().catch((err: unknown) => setError(err instanceof Error ? err.message : "Desk failed."));
  }, []);

  async function act(chain: string, action: "export" | "import") {
    setError(null);
    const res = await fetch("/api/wallets/desk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, chain, secret: action === "import" ? secret : undefined }),
    });
    const body = await readApiJson<{ error?: string; secret?: string; address?: string }>(res);
    if (!res.ok) {
      setError(body.error ?? "Failed.");
      return;
    }
    if (body.secret) setShown(body.secret);
    await load().catch(() => undefined);
  }

  return (
    <div className="space-y-4 rounded-3xl border border-white/10 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Your desk</p>
      <p className="text-sm text-white/55">
        Created on first open. This is your dev wallet on every chain. Fund the address, then launch. The pad signs
        with this key. Fees land here.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {CHAINS.map((chain) => (
          <div key={chain.id} className="rounded-2xl border border-white/10 p-4">
            <p className="text-sm text-white/45">{chain.label}</p>
            <p className="mt-2 break-all font-mono text-xs">{desk?.wallets[chain.id] ?? "—"}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => void act(chain.id, "export")}>
                Export
              </Button>
              {desk?.explorers[chain.id] ? (
                <Button type="button" variant="outline" asChild>
                  <a href={desk.explorers[chain.id]!} target="_blank" rel="noreferrer">
                    Explorer
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <div>
        <Input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Paste a secret to import" />
        <div className="mt-2 flex flex-wrap gap-2">
          {CHAINS.map((chain) => (
            <Button key={chain.id} type="button" variant="outline" onClick={() => void act(chain.id, "import")}>
              Import {chain.label}
            </Button>
          ))}
        </div>
      </div>
      {shown ? <p className="break-all rounded-2xl border border-amber-300/20 p-3 font-mono text-xs">{shown}</p> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}
