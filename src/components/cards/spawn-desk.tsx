"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CARD_FLYWHEELS, type CardFlywheel } from "@/lib/cards/types";
import { CoverField, type CoverPick } from "@/components/launch/cover-field";
import { readApiJson } from "@/lib/http/read-json";
import { cn } from "@/lib/utils";

type Preview = {
  handle: string;
  name: string;
  text: string;
  coverUrl: string | null;
  tweetUrl: string;
};

type MyToken = {
  slug: string;
  title: string;
  ticker: string;
  chain: string;
  coverUrl: string | null;
  progressBps: number;
  graduated: boolean;
};

function Step({
  n,
  title,
  hint,
  children,
}: {
  n: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 p-5">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-arc/70">{n}</span>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {hint ? <p className="mt-1 text-xs text-white/40">{hint}</p> : null}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

export function SpawnDesk({
  handle,
  mode = "card",
  storySlug: initialStory,
  ticker: initialTicker,
  title: initialTitle,
}: {
  handle: string | null;
  mode?: "tweet" | "card";
  storySlug?: string;
  ticker?: string;
  title?: string;
}) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [title, setTitle] = useState(initialTitle ?? "");
  const [ticker, setTicker] = useState((initialTicker ?? "").toUpperCase());
  const [startPriceUi, setStartPriceUi] = useState("5");
  const [startMcapUi, setStartMcapUi] = useState("25000");
  const [flywheel, setFlywheel] = useState<CardFlywheel>(
    initialStory ? "pair" : mode === "tweet" ? "tweet" : "creator",
  );
  const [payAddress, setPayAddress] = useState("");
  const [payNetwork, setPayNetwork] = useState<"arc" | "solana">("arc");
  const [storySlug, setStorySlug] = useState(initialStory ?? "");
  const [myTokens, setMyTokens] = useState<MyToken[] | null>(null);
  const [cover, setCover] = useState<CoverPick | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/api/stories/mine", { cache: "no-store" })
      .then((res) => readApiJson<{ tokens?: MyToken[] }>(res))
      .then((body) => {
        if (live) setMyTokens(body.tokens ?? []);
      })
      .catch(() => live && setMyTokens([]));
    return () => {
      live = false;
    };
  }, []);

  async function loadTweet() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/cards/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const body = await readApiJson<{ error?: string; tweet?: Preview }>(res);
      if (!res.ok || !body.tweet) throw new Error(body.error ?? "Could not read that post.");
      setPreview(body.tweet);
      setTitle(body.tweet.name);
      setTicker(body.tweet.handle.replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase());
      if (body.tweet.coverUrl) {
        setCover({ url: body.tweet.coverUrl, imageUri: body.tweet.coverUrl, cid: null, storage: "supabase" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Preview failed.");
    } finally {
      setBusy(false);
    }
  }

  async function spawn(event: React.FormEvent) {
    event.preventDefault();
    if (!handle) {
      setError("Sign in with X first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/cards/spawn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url || preview?.tweetUrl,
          title,
          ticker,
          startPriceUi: Number(startPriceUi),
          startMcapUi: Number(startMcapUi),
          flywheel,
          creatorPayAddress: payAddress,
          payNetwork,
          storySlug: storySlug || null,
          coverUrl: cover?.url ?? preview?.coverUrl ?? null,
          blurb: preview?.text,
        }),
      });
      const body = await readApiJson<{ error?: string; slug?: string }>(res);
      if (!res.ok || !body.slug) throw new Error(body.error ?? "Spawn failed.");
      router.push(`/cards/${body.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Spawn failed.");
    } finally {
      setBusy(false);
    }
  }

  const multipleExample = 100_000 / Math.max(1, Number(startMcapUi) || 25_000);
  const futureValue = (Number(startPriceUi) || 5) * multipleExample;

  return (
    <form onSubmit={spawn} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
          {mode === "tweet" ? "Tweet card" : "Press card"}
        </p>

        <Step n="01" title="Content" hint="A tweet, an image, or both.">
          <div>
            <Label>{mode === "tweet" ? "X post (required)" : "X post (optional)"}</Label>
            <div className="mt-2 flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://x.com/user/status/…"
                required={mode === "tweet"}
              />
              <Button type="button" variant="outline" onClick={() => void loadTweet()} disabled={busy}>
                Read
              </Button>
            </div>
          </div>
          {preview ? (
            <div className="overflow-hidden rounded-2xl border border-white/10">
              {preview.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview.coverUrl} alt="" className="h-32 w-full object-cover" />
              ) : null}
              <div className="p-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">@{preview.handle}</p>
                <p className="mt-1 text-sm text-white/70">{preview.text}</p>
              </div>
            </div>
          ) : null}
          <CoverField value={cover} onChange={setCover} />
        </Step>

        <Step n="02" title="Identity & starting price">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input className="mt-2" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label>Ticker</Label>
              <Input className="mt-2" value={ticker} onChange={(e) => setTicker(e.target.value)} required />
            </div>
            <div>
              <Label>Start card price (USDC)</Label>
              <Input className="mt-2" value={startPriceUi} onChange={(e) => setStartPriceUi(e.target.value)} />
            </div>
            <div>
              <Label>Start MC (token)</Label>
              <Input className="mt-2" value={startMcapUi} onChange={(e) => setStartMcapUi(e.target.value)} />
            </div>
          </div>
        </Step>

        <Step
          n="03"
          title="Link a token (optional)"
          hint="Card and coin stay separate — pairing just makes the card's value track the token's MC. Only tokens your own account launched are selectable."
        >
          {myTokens === null ? (
            <p className="text-xs text-white/40">Loading your launched tokens…</p>
          ) : myTokens.length === 0 ? (
            <p className="text-xs text-white/40">You haven&apos;t launched any tokens that can be linked yet.</p>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setStorySlug("")}
                className={cn(
                  "shrink-0 rounded-xl border px-3 py-2 text-sm",
                  storySlug === "" ? "border-white bg-white/10" : "border-white/10 text-white/50",
                )}
              >
                Card only
              </button>
              {myTokens.map((t) => (
                <button
                  key={t.slug}
                  type="button"
                  onClick={() => setStorySlug(t.slug)}
                  className={cn(
                    "shrink-0 rounded-xl border px-3 py-2 text-left text-sm",
                    storySlug === t.slug ? "border-white bg-white/10" : "border-white/10 text-white/60",
                  )}
                >
                  <p className="font-medium">${t.ticker}</p>
                  <p className="text-[10px] uppercase text-white/35">
                    {t.chain} · {t.graduated ? "graduated" : `${(t.progressBps / 100).toFixed(0)}%`}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Step>

        <Step n="04" title="Payout wallet" hint="Where you receive offer settlements when someone buys this card.">
          <div>
            <Label>USDC receive wallet</Label>
            <Input className="mt-2" value={payAddress} onChange={(e) => setPayAddress(e.target.value)} required />
            <div className="mt-2 flex gap-2">
              {(["arc", "solana"] as const).map((net) => (
                <button
                  key={net}
                  type="button"
                  onClick={() => setPayNetwork(net)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm capitalize",
                    payNetwork === net ? "border-white bg-white text-black" : "border-white/15 text-white/60",
                  )}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>
        </Step>

        <Step n="05" title="Pricing mode" hint="How this card's value behaves over time.">
          <div className="grid gap-2 sm:grid-cols-2">
            {CARD_FLYWHEELS.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setFlywheel(row.id)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left",
                  flywheel === row.id ? "border-white bg-white/10" : "border-white/10 text-white/70",
                )}
              >
                <p className="font-semibold">{row.label}</p>
                <p className="mt-1 text-xs text-white/45">{row.hint}</p>
              </button>
            ))}
          </div>
        </Step>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Minting…" : "Mint card"}
        </Button>
      </div>

      <aside className="h-fit rounded-3xl border border-white/10 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Example</p>
        <p className="mt-3 text-sm text-white/65">
          Start ${startPriceUi} at {Number(startMcapUi).toLocaleString()} MC. If the paired token hits $100k MC,
          this card&apos;s reference value becomes {formatLoose(futureValue)}.
        </p>
        <p className="mt-4 text-sm text-white/50">
          This mints a real, transferable NFT to your desk wallet. When someone buys it, they send an offer, you
          accept, and settlement happens automatically as one on-chain transaction — no manual payment-proof step.
        </p>
      </aside>
    </form>
  );
}

function formatLoose(value: number) {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}
