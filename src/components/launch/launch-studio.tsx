"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  VENUES,
  findChain,
  type LaunchVenue,
  type PrintableChain,
} from "@onceupon/config/solana";
import { MODE_COPY, RIGHTS_TICK, feeExample } from "@onceupon/config/copy";
import { PROTOCOL } from "@onceupon/config/arc";
import { findQuote, type QuoteGroup } from "@onceupon/config/quotes";
import { QuotePicker } from "@/components/launch/quote-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XMark } from "@/components/x-mark";
import { cn } from "@/lib/utils";

export function LaunchStudio({
  chain,
  handle,
  signedIn,
}: {
  chain: PrintableChain;
  handle: string | null;
  signedIn: boolean;
}) {
  const router = useRouter();
  const selectedChain = findChain(chain)!;
  const [venue, setVenue] = useState<LaunchVenue>("spl");
  const [engine, setEngine] = useState<"author" | "onceuponers">("author");
  const [quoteGroup, setQuoteGroup] = useState<QuoteGroup>("sol");
  const [quoteId, setQuoteId] = useState("sol");
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
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!signedIn) {
      setWalletAddress(null);
      setBalance(null);
      return;
    }
    let cancelled = false;
    fetch("/api/wallets/embedded")
      .then((res) => res.json())
      .then((body) => {
        if (cancelled) return;
        if (typeof body.address === "string") setWalletAddress(body.address);
        if (typeof body.balance === "number") setBalance(body.balance);
      })
      .catch(() => {
        if (!cancelled) setWalletAddress(null);
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const cap = engine === "author" ? PROTOCOL.authorModeAuthorBpsCap : PROTOCOL.onceuponersAuthorBpsCap;
  const selectedQuote = findQuote(quoteId);
  const example = useMemo(() => feeExample(1000, Math.min(authorBps, cap)), [authorBps, cap]);
  const canSubmit = signedIn && rights && !busy;

  async function launch(event: React.FormEvent) {
    event.preventDefault();
    if (!signedIn) {
      setError("Sign in with X first. Your handle is identity on the pad.");
      return;
    }
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
          quoteId,
          quoteMint: quoteMint.trim() || selectedQuote?.mint || undefined,
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
      setStatus(`Live. Mint ${body.mint}`);
      router.push(`/story/${body.slug}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={launch} className="space-y-5">
      <section className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/20 px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">The Press</p>
          <h2 className="font-heading text-xl font-bold">
            {selectedChain.title}
            <span className="ml-2 text-sm font-normal text-parchment/60">· {selectedChain.badge}</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{chain === "solana" ? "Prints here" : `Tagged for ${selectedChain.title}`}</Badge>
          <Link href="/launch" className="text-sm text-gold hover:underline">
            Change chain
          </Link>
        </div>
      </section>

      {!signedIn ? (
        <Alert>
          <AlertTitle>Compose now. Sign in to print.</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>The Solana press is open. Sign in with X to mint from your pad wallet.</span>
            <Button asChild size="sm">
              <a href="/auth/login">
                <XMark className="size-3.5" />
                Sign in with X
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="glass rounded-2xl border border-gold/20 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">1 · Venue</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {VENUES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setVenue(item.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                venue === item.id ? "border-gold bg-gold/15" : "border-gold/15 bg-white/5",
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold">{item.title}</p>
              <p className="font-heading mt-0.5 text-base font-bold">{item.headline}</p>
              <p className="mt-1 text-sm text-parchment/65">{item.body}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl border border-gold/20 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">2 · Fee engine</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(["author", "onceuponers"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setEngine(id);
                setAuthorBps((bps) => Math.min(bps, id === "author" ? 300 : 100));
              }}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                engine === id ? "border-gold bg-gold/15" : "border-gold/15 bg-white/5",
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-gold">{MODE_COPY[id].title}</p>
              <p className="font-heading mt-0.5 text-base font-bold">{MODE_COPY[id].headline}</p>
              <p className="mt-1 text-sm text-parchment/65">{MODE_COPY[id].body}</p>
            </button>
          ))}
        </div>
      </section>

      <QuotePicker
        group={quoteGroup}
        quoteId={quoteId}
        mint={quoteMint}
        onGroup={setQuoteGroup}
        onQuoteId={setQuoteId}
        onMint={setQuoteMint}
      />

      <section className="glass space-y-4 rounded-2xl border border-gold/20 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">4 · Print it</p>
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
        {venue === "pons" || venue === "pumpfun" ? (
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
        {engine === "onceuponers" ? (
          <label className="flex items-start gap-3 text-sm">
            <Switch checked={autoBuy} onCheckedChange={setAutoBuy} />
            <span>Auto-buy the quote with every vault cut. Holders claim that bag as The Piece.</span>
          </label>
        ) : null}
        <label className="flex items-start gap-3 text-sm">
          <Switch checked={rights} onCheckedChange={setRights} />
          <span>{RIGHTS_TICK}</span>
        </label>
        <div className="rounded-xl border border-gold/15 bg-black/20 p-3 text-sm text-parchment/70">
          <p>
            Pad wallet {handle ? `@${handle}` : "(sign in)"}: {walletAddress ?? "provisioning after sign-in"}{" "}
            {balance != null ? `· ${balance.toFixed(3)} SOL` : null}
          </p>
          <p className="mt-1">{selectedChain.printNote}</p>
          <p className="mt-1">
            {venue === "nft"
              ? "Mints a real token on Solana mainnet. Needs SOL in the pad wallet."
              : selectedQuote
                ? `Bonds until ${selectedQuote.graduationUi.toLocaleString("en-US")} ${selectedQuote.symbol}. Buys settle in ${selectedQuote.symbol}.`
                : "Paste a mint. The pad inspects it on Solana mainnet and uses it as quote liquidity."}
          </p>
        </div>
        <Button type="submit" disabled={!canSubmit}>
          {busy
            ? "Printing on Solana…"
            : !signedIn
              ? "Sign in with X to launch"
              : chain === "solana"
                ? "Launch on Solana mainnet"
                : `Launch · tagged for ${selectedChain.title}`}
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
