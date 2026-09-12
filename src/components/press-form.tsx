"use client";

import { useMemo, useState } from "react";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MODE_COPY, RIGHTS_TICK, RWA_GATE, feeExample } from "@onceupon/config/copy";
import { ARC_TESTNET, PROTOCOL } from "@onceupon/config/arc";

const PAIRS = [
  { id: "usdc", label: "USDC", listed: true },
  { id: "eurc", label: "EURC", listed: true },
  { id: "rwa", label: "Tokenized RWA / single-name", listed: false },
] as const;

export function PressForm({
  handle,
  primaryWallet,
  verifiedAt,
}: {
  handle: string;
  primaryWallet: string | null;
  verifiedAt: string | null;
}) {
  const [engine, setEngine] = useState<"author" | "onceuponers">("author");
  const [title, setTitle] = useState("");
  const [ticker, setTicker] = useState("");
  const [blurb, setBlurb] = useState("");
  const [authorBps, setAuthorBps] = useState<number>(PROTOCOL.authorModeSuggestedBps);
  const [pair, setPair] = useState<(typeof PAIRS)[number]["id"]>("usdc");
  const [rights, setRights] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cap = engine === "author" ? PROTOCOL.authorModeAuthorBpsCap : PROTOCOL.onceuponersAuthorBpsCap;
  const example = useMemo(() => feeExample(1000, Math.min(authorBps, cap)), [authorBps, cap]);
  const selectedPair = PAIRS.find((p) => p.id === pair)!;
  const verifiedRecently = Boolean(verifiedAt);

  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: connecting } = useConnect();
  const { signMessageAsync } = useSignMessage();

  async function verifyWallet() {
    setError(null);
    const injected = connectors[0];
    if (!isConnected) {
      if (!injected) {
        setError("No injected wallet found. Install MetaMask, Rabby, or Coinbase Wallet.");
        return;
      }
      connect({ connector: injected });
      return;
    }
    if (!address) return;
    const issuedAt = new Date().toISOString();
    const me = await fetch("/api/me").then((r) => r.json());
    const message = `OnceUpon:${me.id}:${issuedAt}`;
    const signature = await signMessageAsync({ message });
    const res = await fetch("/api/wallets/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address, issuedAt, signature, chainCaip2: ARC_TESTNET.caip2 }),
    });
    const body = await res.json();
    if (!res.ok) {
      setError(body.error ?? "Wallet verification failed.");
      return;
    }
    setStatus("Arc wallet bound. You may draft a Story.");
  }

  async function saveDraft(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/stories/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          ticker,
          blurb,
          engine,
          authorBps: Math.min(authorBps, cap),
          pairClass: selectedPair.listed ? pair : "usdc",
          pairLabel: selectedPair.listed ? selectedPair.label : "USDC",
          rightsAttested: rights,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Draft was refused.");
        return;
      }
      setStatus(`Draft saved as ${body.slug}. Launch still needs a verified wallet and factory calldata.`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={saveDraft} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["author", MODE_COPY.author],
              ["onceuponers", MODE_COPY.onceuponers],
            ] as const
          ).map(([id, copy]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setEngine(id);
                setAuthorBps((bps) => Math.min(bps, id === "author" ? 300 : 100));
              }}
              className={`rounded-xl border p-4 text-left ${
                engine === id ? "border-gold bg-gold/10" : "border-gold/20 bg-card"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-gold">{copy.title}</p>
              <p className="font-heading mt-1 text-xl">{copy.headline}</p>
              <p className="mt-1 text-sm text-parchment/70">{copy.body}</p>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ticker">Ticker</Label>
          <Input
            id="ticker"
            value={ticker}
            maxLength={12}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blurb">Blurb</Label>
          <Textarea id="blurb" value={blurb} onChange={(e) => setBlurb(e.target.value)} rows={4} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fee">
            Author fee {engine === "author" ? "(0–3.00%)" : "(0–1.00% in OnceUponers mode)"}
          </Label>
          <input
            id="fee"
            type="range"
            min={0}
            max={cap}
            value={Math.min(authorBps, cap)}
            onChange={(e) => setAuthorBps(Number(e.target.value))}
            className="w-full accent-[#c9a227]"
          />
          <p className="text-sm text-gold">
            {(Math.min(authorBps, cap) / 100).toFixed(2)}% · {Math.min(authorBps, cap)} bps
          </p>
          <p className="text-sm text-parchment/70">{example}</p>
        </div>

        <div className="space-y-2">
          <Label>Pair</Label>
          <div className="flex flex-wrap gap-2">
            {PAIRS.map((p) => (
              <Button
                key={p.id}
                type="button"
                variant={pair === p.id ? "default" : "outline"}
                onClick={() => setPair(p.id)}
              >
                {p.label}
              </Button>
            ))}
          </div>
          {!selectedPair.listed ? (
            <Alert>
              <AlertTitle>Not listed on Arc yet</AlertTitle>
              <AlertDescription>{RWA_GATE}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <label className="flex items-start gap-3 text-sm">
          <Switch checked={rights} onCheckedChange={setRights} />
          <span>{RIGHTS_TICK}</span>
        </label>

        <Button type="submit" disabled={busy || !rights}>
          {busy ? "Saving draft…" : "Save draft"}
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Arc wallet</CardTitle>
            <CardDescription>
              Launching requires X plus a verified wallet signature in the last 24 hours. Drafts can wait.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>OnceUponer @{handle}</p>
            <p className="break-all text-parchment/70">
              Primary: {primaryWallet ?? address ?? "none yet"}
            </p>
            {verifiedRecently ? (
              <Badge>Verified this day</Badge>
            ) : (
              <Button type="button" variant="secondary" onClick={verifyWallet} disabled={connecting}>
                {isConnected ? "Sign OnceUpon message" : "Connect Arc wallet"}
              </Button>
            )}
          </CardContent>
        </Card>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>The Press stopped</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {status ? (
          <Alert>
            <AlertTitle>Noted</AlertTitle>
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        ) : null}
      </div>
    </form>
  );
}
