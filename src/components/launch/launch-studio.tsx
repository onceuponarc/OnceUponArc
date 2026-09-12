"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CHAINS, SOLANA, VENUES, type LaunchChain, type LaunchVenue, type QuoteKind } from "@onceupon/config/solana";
import { MODE_COPY, RIGHTS_TICK, RWA_GATE, feeExample } from "@onceupon/config/copy";
import { PROTOCOL } from "@onceupon/config/arc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

const QUOTES: { id: QuoteKind; label: string; listed: boolean }[] = [
  { id: "sol", label: "SOL", listed: true },
  { id: "usdc", label: "USDC", listed: true },
  { id: "meme", label: "Any meme mint", listed: true },
  { id: "custom", label: "Any SPL mint", listed: true },
  { id: "stock", label: "Tokenized name / stock", listed: false },
];

export function LaunchStudio({
  handle,
  walletAddress,
  balance,
}: {
  handle: string;
  walletAddress: string | null;
  balance: number | null;
}) {
  const router = useRouter();
  const [chain, setChain] = useState<LaunchChain>("solana");
  const [venue, setVenue] = useState<LaunchVenue>("spl");
  const [engine, setEngine] = useState<"author" | "onceuponers">("author");
  const [quoteKind, setQuoteKind] = useState<QuoteKind>("sol");
  const [quoteMint, setQuoteMint] = useState("");
  const [autoBuy, setAutoBuy] = useState(true);
  const [title, setTitle] = useState("");
  const [ticker, setTicker] = useState("");
  const [blurb, setBlurb] = useState("");
  const [authorBps, setAuthorBps] = useState<number>(PROTOCOL.authorModeSuggestedBps);
  const [snipeTaxBps, setSnipeTaxBps] = useState(0);
  const [nftSupply, setNftSupply] = useState(1);
  const [rights, setRights] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const cap = engine === "author" ? PROTOCOL.authorModeAuthorBpsCap : PROTOCOL.onceuponersAuthorBpsCap;
  const live = CHAINS.find((item) => item.id === chain)?.live ?? false;
  const selectedQuote = QUOTES.find((item) => item.id === quoteKind)!;
  const example = useMemo(() => feeExample(1000, Math.min(authorBps, cap)), [authorBps, cap]);
  const needsMint = quoteKind === "meme" || quoteKind === "custom" || quoteKind === "stock";

  async function launch(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch("/api/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chain,
          venue,
          engine,
          title,
          ticker,
          blurb,
          authorBps: Math.min(authorBps, cap),
          snipeTaxBps,
          quoteKind,
          quoteMint: quoteMint.trim() || (quoteKind === "usdc" ? SOLANA.usdcMint : undefined),
          pairLabel:
            quoteKind === "sol"
              ? "SOL"
              : quoteKind === "usdc"
                ? "USDC"
                : quoteKind === "stock"
                  ? "Tokenized name"
                  : "Custom mint",
          autoBuyRewards: engine === "onceuponers" && autoBuy,
          rewardMint: quoteMint.trim() || undefined,
          nftSupply,
          rightsAttested: rights,
        }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body.error ?? "Launch failed.");
        return;
      }
      setStatus(`Live on Solana. Mint ${body.mint}`);
      router.push(`/story/${body.slug}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={launch} className="space-y-6">
      <section className="glass rounded-2xl border border-gold/20 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">1 · Chain</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {CHAINS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setChain(item.id)}
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                chain === item.id ? "border-gold bg-gold/15" : "border-gold/15 bg-white/5",
                !item.live && "opacity-80",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-heading text-lg font-bold">{item.title}</p>
                <Badge variant={item.live ? "default" : "outline"}>{item.badge}</Badge>
              </div>
              <p className="mt-2 text-sm text-parchment/65">{item.body}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl border border-gold/20 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">2 · Venue</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {VENUES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setVenue(item.id)}
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                venue === item.id ? "border-gold bg-gold/15" : "border-gold/15 bg-white/5",
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold">{item.title}</p>
              <p className="font-heading mt-1 text-xl font-bold">{item.headline}</p>
              <p className="mt-1 text-sm text-parchment/65">{item.body}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl border border-gold/20 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">3 · Fee engine</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(["author", "onceuponers"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setEngine(id);
                setAuthorBps((bps) => Math.min(bps, id === "author" ? 300 : 100));
              }}
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                engine === id ? "border-gold bg-gold/15" : "border-gold/15 bg-white/5",
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold">{MODE_COPY[id].title}</p>
              <p className="font-heading mt-1 text-xl font-bold">{MODE_COPY[id].headline}</p>
              <p className="mt-1 text-sm text-parchment/65">{MODE_COPY[id].body}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl border border-gold/20 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">4 · Pair & rewards</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUOTES.map((item) => (
            <Button
              key={item.id}
              type="button"
              variant={quoteKind === item.id ? "default" : "outline"}
              onClick={() => setQuoteKind(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </div>
        {needsMint ? (
          <div className="mt-4 space-y-2">
            <Label htmlFor="mint">Quote / reward mint</Label>
            <Input
              id="mint"
              value={quoteMint}
              onChange={(e) => setQuoteMint(e.target.value)}
              placeholder="Solana mint address"
            />
          </div>
        ) : null}
        {!selectedQuote.listed ? (
          <Alert className="mt-4">
            <AlertTitle>Not listed as a quote mint yet</AlertTitle>
            <AlertDescription>{RWA_GATE}</AlertDescription>
          </Alert>
        ) : null}
        {engine === "onceuponers" ? (
          <label className="mt-4 flex items-start gap-3 text-sm">
            <Switch checked={autoBuy} onCheckedChange={setAutoBuy} />
            <span>
              Auto-buy the pair with every vault cut. Holders claim that bag as The Piece — SOL today,
              the paired mint when that market exists.
            </span>
          </label>
        ) : null}
      </section>

      <section className="glass rounded-2xl border border-gold/20 p-5 space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">5 · Print it</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Name</Label>
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="blurb">Pitch</Label>
          <Textarea id="blurb" value={blurb} onChange={(e) => setBlurb(e.target.value)} rows={3} />
        </div>
        {venue === "nft" ? (
          <div className="space-y-2">
            <Label htmlFor="editions">Editions</Label>
            <Input
              id="editions"
              type="number"
              min={1}
              max={10000}
              value={nftSupply}
              onChange={(e) => setNftSupply(Number(e.target.value))}
            />
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="fee">
            Author fee {engine === "author" ? "(0–3.00%)" : "(0–1.00% OnceUponers cap)"}
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
            {(Math.min(authorBps, cap) / 100).toFixed(2)}% · protocol {(PROTOCOL.protocolBpsDefault / 100).toFixed(2)}%
          </p>
          <p className="text-sm text-parchment/65">{example}</p>
        </div>
        {(venue === "pons" || venue === "pumpfun") ? (
          <div className="space-y-2">
            <Label htmlFor="snipe">Snipe tax (first 15 minutes, 0–5.00%)</Label>
            <input
              id="snipe"
              type="range"
              min={0}
              max={500}
              value={snipeTaxBps}
              onChange={(e) => setSnipeTaxBps(Number(e.target.value))}
              className="w-full accent-[#c9a227]"
            />
            <p className="text-sm text-gold">{(snipeTaxBps / 100).toFixed(2)}%</p>
          </div>
        ) : null}
        <label className="flex items-start gap-3 text-sm">
          <Switch checked={rights} onCheckedChange={setRights} />
          <span>{RIGHTS_TICK}</span>
        </label>
        <div className="rounded-xl border border-gold/15 bg-black/20 p-3 text-sm text-parchment/70">
          <p>
            Pad wallet @{handle}: {walletAddress ?? "provisioning…"}{" "}
            {balance != null ? `· ${balance.toFixed(3)} SOL` : null}
          </p>
          <p className="mt-1">
            {venue === "nft"
              ? "Mints a real Token on Solana devnet."
              : `Bonds until ${SOLANA.bondingGraduationSol} SOL, then marks bonded.`}
          </p>
        </div>
        <Button type="submit" size="lg" className="h-11 w-full sm:w-auto" disabled={busy || !rights || !live}>
          {busy ? "Printing on Solana…" : live ? "Launch on Solana devnet" : "This chain is coming soon"}
        </Button>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Launch blocked</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {status ? (
          <Alert>
            <AlertTitle>Live</AlertTitle>
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        ) : null}
      </section>
    </form>
  );
}
