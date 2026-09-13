"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  VENUES,
  SOLANA,
  findChain,
  type LaunchVenue,
  type PrintableChain,
} from "@onceupon/config/solana";
import { MODE_COPY, RIGHTS_TICK, feeExample } from "@onceupon/config/copy";
import { PROTOCOL } from "@onceupon/config/arc";
import {
  PAD_NAME,
  PUMPFUN_CURVE_REFERENCE,
  feesForVenue,
  venueLabel,
} from "@onceupon/config/launchpad";
import { findQuote, type QuoteGroup } from "@onceupon/config/quotes";
import { QuotePicker } from "@/components/launch/quote-picker";
import { PoolPicker, type LinkedPoolPick } from "@/components/launch/pool-picker";
import { CoverField, type CoverPick } from "@/components/launch/cover-field";
import { TokenomicsFields } from "@/components/launch/tokenomics-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { XMark } from "@/components/x-mark";
import { SolanaConnectButton } from "@/components/wallet/connect-button";
import { useWalletSigner } from "@/components/wallet/use-wallet-signer";
import { readApiJson } from "@/lib/http/read-json";
import { fetchLaunchBlockhash } from "@/lib/solana/blockhash";
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
  const { address, signAndSend, ensureBound } = useWalletSigner();
  const [venue, setVenue] = useState<LaunchVenue>("spl");
  const [engine, setEngine] = useState<"author" | "onceuponers">("author");
  const [quoteGroup, setQuoteGroup] = useState<QuoteGroup>("sol");
  const [quoteId, setQuoteId] = useState("sol");
  const [quoteMint, setQuoteMint] = useState("");
  const [title, setTitle] = useState("");
  const [ticker, setTicker] = useState("");
  const [blurb, setBlurb] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");
  const [cover, setCover] = useState<CoverPick | null>(null);
  const [authorBps, setAuthorBps] = useState<number>(PROTOCOL.authorModeSuggestedBps);
  const [snipeTaxBps, setSnipeTaxBps] = useState(0);
  const [nftSupply, setNftSupply] = useState(1);
  const [supplyUi, setSupplyUi] = useState<number>(SOLANA.defaultSupply);
  const [decimals, setDecimals] = useState<number>(SOLANA.defaultDecimals);
  const [graduationUi, setGraduationUi] = useState<number>(SOLANA.bondingGraduationSol);
  const [virtualUi, setVirtualUi] = useState<number>(SOLANA.virtualQuoteSol);
  const [rights, setRights] = useState(false);
  const [linkedPool, setLinkedPool] = useState<LinkedPoolPick | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const cap = engine === "author" ? PROTOCOL.authorModeAuthorBpsCap : PROTOCOL.onceuponersAuthorBpsCap;
  const selectedQuote = findQuote(quoteId);
  const venueFees = feesForVenue(venue, engine);
  const example = useMemo(() => feeExample(1000, Math.min(authorBps, cap)), [authorBps, cap]);
  const needsArt = venue === "pumpfun";
  const canSubmit = signedIn && Boolean(address) && rights && !busy && (!needsArt || Boolean(cover?.url));

  async function launch(event: React.FormEvent) {
    event.preventDefault();
    if (!signedIn) {
      setError("Sign in with X first. Your handle is identity on the pad.");
      return;
    }
    if (!address) {
      setError("Connect a Solana wallet. It pays rent and signs the mint.");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus(null);
    try {
      setStatus("Bind this wallet to your X account…");
      const payer = await ensureBound();
      setStatus("Fetching a Solana blockhash…");
      const latest = await fetchLaunchBlockhash();
      setStatus("Building the mint…");
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
          autoBuyRewards: false,
          rewardMint: quoteMint.trim() || undefined,
          nftSupply,
          supplyUi: venue === "nft" ? nftSupply : supplyUi,
          decimals: venue === "nft" ? 0 : decimals,
          graduationUi,
          virtualUi,
          rightsAttested: rights,
          payer,
          recentBlockhash: latest.blockhash,
          poolAddress: linkedPool?.address,
          poolDex: linkedPool?.dex,
          poolLabel: linkedPool?.label,
          poolUrl: linkedPool?.url,
          poolChain: linkedPool?.chain,
          poolDepthUsd: linkedPool?.depthUsd,
          poolQuoteAddress: linkedPool?.quoteAddress ?? undefined,
          coverUrl: cover?.url,
          imageUri: cover?.imageUri,
          twitterUrl: twitter.trim() || undefined,
          telegramUrl: telegram.trim() || undefined,
          websiteUrl: website.trim() || undefined,
        }),
      });
      const body = await readApiJson<{
        error?: string;
        transaction?: string;
        transactions?: string[];
        slug?: string;
        mint?: string;
      }>(res);
      if (!res.ok) {
        setError(body.error ?? "Launch failed.");
        return;
      }
      const txs =
        Array.isArray(body.transactions) && body.transactions.length
          ? body.transactions
          : body.transaction
            ? [body.transaction]
            : [];
      if (!txs.length || !body.slug) {
        setError("The press did not return a transaction to sign and pay.");
        return;
      }
      let sent = { signature: "", explorer: "" };
      for (let i = 0; i < txs.length; i += 1) {
        setStatus(
          txs.length > 1
            ? `Sign and pay transaction ${i + 1} of ${txs.length} in your wallet…`
            : "Sign and pay the mint in your wallet…",
        );
        sent = await signAndSend(txs[i]);
      }
      setStatus("Confirming on Solana…");
      const confirm = await fetch("/api/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true, slug: body.slug, signature: sent.signature }),
      });
      const confirmed = await readApiJson<{ error?: string }>(confirm);
      if (!confirm.ok) {
        setError(confirmed.error ?? "Mint landed but the pad could not mark it live. Open the Story.");
        router.push(`/story/${body.slug}`);
        return;
      }
      setStatus(`Live. Mint ${body.mint}`);
      router.push(`/story/${body.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Launch failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={launch} className="space-y-5">
      <section className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-arc/20 px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">The Press</p>
          <h2 className="font-heading text-xl font-bold">
            {selectedChain.title}
            <span className="ml-2 text-sm font-normal text-parchment/60">· {selectedChain.badge}</span>
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Badge>{chain === "arc" ? "Home chain" : chain === "solana" ? "Prints here" : `Tagged for ${selectedChain.title}`}</Badge>
          <Link href="/launch" className="text-sm text-arc hover:underline">
            Change chain
          </Link>
        </div>
      </section>

      {!signedIn ? (
        <Alert>
          <AlertTitle>Compose now. Sign in to print.</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-3">
            <span>Sign in with X, then connect Phantom, Solflare, or Backpack to mint.</span>
            <Button asChild size="sm">
              <a href="/auth/login">
                <XMark className="size-3.5" />
                Sign in with X
              </a>
            </Button>
          </AlertDescription>
        </Alert>
      ) : !address ? (
        <Alert>
          <AlertTitle>Connect a Solana wallet</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>Connect Phantom, Solflare, or Backpack. Approve the bind message, then sign and pay the mint.</span>
            <SolanaConnectButton />
          </AlertDescription>
        </Alert>
      ) : null}

      <section className="glass rounded-2xl border border-arc/20 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">1 · Venue</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {VENUES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setVenue(item.id);
                const next = feesForVenue(item.id, engine);
                setAuthorBps(
                  engine === "onceuponers" ? 0 : Math.min(next.authorBps, PROTOCOL.authorModeAuthorBpsCap),
                );
                setSnipeTaxBps(item.id === "spl" || item.id === "nft" ? 0 : next.snipeTaxBps);
              }}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                venue === item.id ? "border-arc bg-arc/15" : "border-white/10 bg-white/5",
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-arc">{item.title}</p>
              <p className="font-heading mt-0.5 text-base font-bold">{item.headline}</p>
              <p className="mt-1 text-sm text-parchment/65">{item.body}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-2xl border border-arc/20 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">2 · Rewards</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(["author", "onceuponers"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setEngine(id);
                const next = feesForVenue(venue, id);
                setAuthorBps(id === "onceuponers" ? 0 : Math.min(next.authorBps, PROTOCOL.authorModeAuthorBpsCap));
              }}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                engine === id ? "border-arc bg-arc/15" : "border-white/10 bg-white/5",
              )}
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-arc">{MODE_COPY[id].title}</p>
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
        onGroup={(group) => {
          setQuoteGroup(group);
        }}
        onQuoteId={(id) => {
          setQuoteId(id);
          const listed = findQuote(id);
          if (listed) {
            setGraduationUi(listed.graduationUi);
            setVirtualUi(listed.virtualUi);
          }
        }}
        onMint={setQuoteMint}
      />

      <PoolPicker
        chain={chain}
        quoteId={quoteId}
        mint={quoteMint || selectedQuote?.mint || ""}
        venue={venue}
        selected={linkedPool}
        onSelect={setLinkedPool}
      />

      <section className="glass space-y-4 rounded-2xl border border-arc/20 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">4 · Print it</p>
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
        <CoverField value={cover} required={needsArt} onChange={setCover} />
        {venue !== "nft" ? (
          <TokenomicsFields
            symbol={selectedQuote?.symbol ?? "QUOTE"}
            supplyUi={supplyUi}
            decimals={decimals}
            graduationUi={graduationUi}
            virtualUi={virtualUi}
            onSupply={setSupplyUi}
            onDecimals={setDecimals}
            onGraduation={setGraduationUi}
            onVirtual={setVirtualUi}
          />
        ) : null}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="twitter">X / Twitter</Label>
            <Input
              id="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="@handle or x.com/…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram</Label>
            <Input
              id="telegram"
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@group or t.me/…"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://"
            />
          </div>
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
        {engine === "author" ? (
          <div className="space-y-2">
            <Label htmlFor="fee">Creator fee (0–3.00%), paid to you on every trade</Label>
            <input
              id="fee"
              type="range"
              min={0}
              max={cap}
              value={Math.min(authorBps, cap)}
              onChange={(e) => setAuthorBps(Number(e.target.value))}
              className="w-full accent-[#3ee0c6]"
            />
            <p className="text-sm text-arc">
              {(Math.min(authorBps, cap) / 100).toFixed(2)}% · protocol {(PROTOCOL.protocolBpsDefault / 100).toFixed(2)}%
            </p>
            <p className="text-sm text-parchment/65">{example}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-parchment/70">
            <p className="font-medium text-parchment">Holder claims · you fund the pool</p>
            <p className="mt-1">
              Trades take only the {(PROTOCOL.protocolBpsDefault / 100).toFixed(2)}% protocol cut. After the mint is
              live, deposit {selectedQuote?.symbol ?? "quote"} into the vault. Holders claim a share proportional to
              what they hold. That is not a dividend.
            </p>
          </div>
        )}
        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-parchment/70">
            <p className="font-medium text-parchment">{venueFees.headline}</p>
            <p className="mt-1">
              {engine === "author"
                ? `Creator ${(Math.min(authorBps, cap) / 100).toFixed(2)}% · protocol ${(venueFees.protocolBps / 100).toFixed(2)}%`
                : `Protocol ${(venueFees.protocolBps / 100).toFixed(2)}% on trades · holder pool funded by you`}
              {snipeTaxBps > 0 ? ` · snipe +${(snipeTaxBps / 100).toFixed(2)}% (15 min)` : ""}
            </p>
            <p className="mt-1">{venueFees.note}</p>
            {venue === "pumpfun" ? (
              <p className="mt-1 text-parchment/55">
                Pump.fun’s own curve (reference): creator{" "}
                {(PUMPFUN_CURVE_REFERENCE.creatorBps / 100).toFixed(2)}% · protocol{" "}
                {(PUMPFUN_CURVE_REFERENCE.protocolBps / 100).toFixed(2)}% · total{" "}
                {(PUMPFUN_CURVE_REFERENCE.totalBps / 100).toFixed(2)}%. This mint is SPL on OnceUpon, not that program.
              </p>
            ) : null}
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
              className="w-full accent-[#3ee0c6]"
            />
            <p className="text-sm text-arc">{(snipeTaxBps / 100).toFixed(2)}%</p>
          </div>
        ) : null}
        <label className="flex items-start gap-3 text-sm">
          <Switch checked={rights} onCheckedChange={setRights} />
          <span>{RIGHTS_TICK}</span>
        </label>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-parchment/70">
          <p>
            {handle ? `@${handle}` : "Sign in with X"}
            {address ? ` · ${address.slice(0, 4)}…${address.slice(-4)}` : " · connect a wallet"}
            {` · ${PAD_NAME} · ${venueLabel(venue)}`}
          </p>
          <p className="mt-1">{selectedChain.printNote}</p>
          <p className="mt-1">
            {venue === "nft"
              ? "Mints a real token on Solana mainnet with Metaplex metadata. Your wallet signs and pays rent."
              : selectedQuote
                ? `SPL mint · ${supplyUi.toLocaleString("en-US")} supply · ${decimals} decimals · bonds at ${graduationUi.toLocaleString("en-US")} ${selectedQuote.symbol}. Buys settle in ${selectedQuote.symbol}. You pair into that depth — you do not fund an empty pool.`
                : "Paste a mint. The pad inspects it on Solana mainnet and uses it as quote liquidity."}
          </p>
          {linkedPool ? (
            <p className="mt-1">
              Linked pool: {linkedPool.label} · {linkedPool.dex} · {linkedPool.address.slice(0, 6)}…
              {linkedPool.address.slice(-4)}
              {venue === "pumpfun" && linkedPool.dex !== "pumpswap"
                ? " · PumpSwap venue also binds the canonical PumpSwap SOL/USDC pool when the quote is SOL/USDC."
                : ""}
            </p>
          ) : (
            <p className="mt-1">
              {venue === "pumpfun"
                ? "PumpSwap venue auto-pairs PumpSwap for SOL/USDC quotes. Pick or paste a live pool above."
                : "Pick or paste a live pool above. This is a full SPL mint on the OnceUpon curve."}
            </p>
          )}
        </div>
        <Button type="submit" disabled={!canSubmit} className="w-full rounded-full sm:w-auto">
          {busy
            ? status ?? "Printing…"
            : !signedIn
              ? "Sign in with X to launch"
              : !address
                ? "Connect a wallet to launch"
                : chain === "arc"
                  ? `Launch on ${PAD_NAME} · Arc`
                  : chain === "solana"
                    ? `Launch on ${PAD_NAME}`
                    : `Launch on ${PAD_NAME} · tagged for ${selectedChain.title}`}
        </Button>
        {error ? (
          <Alert variant="destructive">
            <AlertTitle>Launch blocked</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {status && !error ? (
          <Alert>
            <AlertTitle>Press</AlertTitle>
            <AlertDescription>{status}</AlertDescription>
          </Alert>
        ) : null}
      </section>
    </form>
  );
}
