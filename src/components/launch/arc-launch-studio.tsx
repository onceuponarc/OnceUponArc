"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CHAPTER } from "@onceupon/config/chapter";
import { PROTOCOL } from "@onceupon/config/arc";
import { MODE_COPY, RIGHTS_TICK, CHAPTER_BUYER_NOTE, feeExample } from "@onceupon/config/copy";
import { PAD_NAME } from "@onceupon/config/launchpad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CoverField, type CoverPick } from "@/components/launch/cover-field";
import { V4LaunchStudio } from "@/components/launch/v4-launch-studio";
import { readApiJson } from "@/lib/http/read-json";
import { cn } from "@/lib/utils";

const STEPS = ["Token", "Curve", "Launch"] as const;

export function ArcLaunchStudio({
  handle,
  pairCard = false,
}: {
  handle: string | null;
  pairCard?: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [engine, setEngine] = useState<"author" | "onceuponers">("author");
  const [title, setTitle] = useState("");
  const [ticker, setTicker] = useState("");
  const [blurb, setBlurb] = useState("");
  const [cover, setCover] = useState<CoverPick | null>(null);
  const [authorBps, setAuthorBps] = useState<number>(PROTOCOL.authorModeSuggestedBps);
  const [graduateUi, setGraduateUi] = useState<number>(CHAPTER.graduateQuoteUi);
  const [rights, setRights] = useState(false);
  const [cardPrice, setCardPrice] = useState("5");
  const [cardMcap, setCardMcap] = useState("25000");
  const [cardPay, setCardPay] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [useV4, setUseV4] = useState(false);

  useEffect(() => {
    fetch("/api/arc/status")
      .then((res) => res.json())
      .then((body: { ready?: boolean; error?: string }) => {
        if (!body.ready || /StoryFactory|ARC_FACTORY|no code/i.test(body.error ?? "")) {
          setUseV4(true);
        }
      })
      .catch(() => setUseV4(true));
  }, []);

  const cap = engine === "author" ? PROTOCOL.authorModeAuthorBpsCap : PROTOCOL.onceuponersAuthorBpsCap;
  const example = feeExample(1000, Math.min(authorBps, cap));

  async function launch(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
      setStatus("Launching on Arc…");
    try {
      const res = await fetch("/api/arc/launch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          ticker,
          blurb,
          engine,
          authorBps: Math.min(authorBps, cap),
          graduateUi,
          coverUrl: cover?.url,
          rightsAttested: rights,
        }),
      });
      const body = await readApiJson<{ error?: string; slug?: string; mint?: string }>(res);
      if (!res.ok || !body.slug) {
        const msg = body.error ?? "Arc launch failed.";
        if (/StoryFactory has no code|ARC_FACTORY/i.test(msg)) {
          setUseV4(true);
          return;
        }
        setError(msg);
        return;
      }
      setStatus("Live on Arc.");
      if (pairCard && cardPay) {
        setStatus("Printing paired jacket…");
        await fetch("/api/cards/spawn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            ticker,
            startPriceUi: Number(cardPrice),
            startMcapUi: Number(cardMcap),
            flywheel: "pair",
            creatorPayAddress: cardPay,
            payNetwork: "arc",
            storySlug: body.slug,
          }),
        });
      }
      router.push(pairCard ? `/cards` : `/story/${body.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Arc launch failed.");
    } finally {
      setBusy(false);
    }
  }

  if (useV4) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-white/55">
          Chapter factory is not on Arc 5042 yet. This desk prints on the live Uniswap v4 zap instead.
        </p>
        <V4LaunchStudio handle={handle} />
      </div>
    );
  }

  return (
    <form onSubmit={launch} className="space-y-5">
      <ol className="grid grid-cols-3 gap-2">
        {STEPS.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => setStep(index)}
              className={cn(
                "w-full rounded-2xl border px-3 py-2 text-left text-sm",
                step === index ? "border-arc bg-arc/15" : "border-white/10 bg-white/5",
              )}
            >
              <span className="text-[11px] uppercase tracking-[0.18em] text-arc">0{index + 1}</span>
              <p className="font-heading font-bold">{label}</p>
            </button>
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <section className="glass space-y-4 rounded-2xl border border-arc/20 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">Token</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="arc-title">Name</Label>
              <Input id="arc-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arc-ticker">Ticker</Label>
              <Input
                id="arc-ticker"
                value={ticker}
                maxLength={12}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="arc-blurb">Pitch</Label>
            <Textarea id="arc-blurb" value={blurb} onChange={(e) => setBlurb(e.target.value)} rows={3} />
          </div>
          <CoverField value={cover} onChange={setCover} />
          <Button type="button" onClick={() => setStep(1)} className="rounded-full">
              Next · Curve
          </Button>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="glass space-y-4 rounded-2xl border border-arc/20 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">Bonding curve</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(["author", "onceuponers"] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setEngine(id);
                  setAuthorBps(id === "onceuponers" ? 0 : PROTOCOL.authorModeSuggestedBps);
                }}
                className={cn(
                  "rounded-xl border p-3 text-left",
                  engine === id ? "border-arc bg-arc/15" : "border-white/10 bg-white/5",
                )}
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-arc">{MODE_COPY[id].title}</p>
                <p className="font-heading mt-0.5 font-bold">{MODE_COPY[id].headline}</p>
                <p className="mt-1 text-sm text-parchment/65">{MODE_COPY[id].body}</p>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="grad">Graduate target (USDC)</Label>
            <Input
              id="grad"
              type="number"
              min={100}
              value={graduateUi}
              onChange={(e) => setGraduateUi(Number(e.target.value))}
            />
            <p className="text-xs text-parchment/55">
              Start cap is ~${CHAPTER.startCapQuoteUi.toLocaleString("en-US")}. 80% trades on the curve. {CHAPTER_BUYER_NOTE}
            </p>
          </div>
          {engine === "author" ? (
            <div className="space-y-2">
              <Label htmlFor="arc-fee">Creator fee (0–3.00%)</Label>
              <input
                id="arc-fee"
                type="range"
                min={0}
                max={cap}
                value={Math.min(authorBps, cap)}
                onChange={(e) => setAuthorBps(Number(e.target.value))}
                className="w-full accent-[#00e5c3]"
              />
              <p className="text-sm text-arc">
                {(Math.min(authorBps, cap) / 100).toFixed(2)}% · protocol {(PROTOCOL.protocolBpsDefault / 100).toFixed(2)}%
              </p>
              <p className="text-sm text-parchment/65">{example}</p>
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(0)} className="rounded-full">
              Back
            </Button>
            <Button type="button" onClick={() => setStep(2)} className="rounded-full">
              Next · Launch
            </Button>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="glass space-y-4 rounded-2xl border border-arc/20 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">Launch on Arc</p>
          <p className="text-sm text-parchment/70">
            {handle ? `@${handle}` : "Arc"} · {PAD_NAME} · USDC curve. Your Arc wallet signs create.
          </p>
          {pairCard ? (
            <div className="space-y-3 rounded-2xl border border-white/10 p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Paired jacket</p>
              <p className="text-sm text-white/55">
                After the token prints, we mint a card at ${cardPrice} against ${Number(cardMcap).toLocaleString()} MC.
                Coin and card stay separate.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Card start price</Label>
                  <Input className="mt-1" value={cardPrice} onChange={(e) => setCardPrice(e.target.value)} />
                </div>
                <div>
                  <Label>Start MC</Label>
                  <Input className="mt-1" value={cardMcap} onChange={(e) => setCardMcap(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>USDC wallet for card buys</Label>
                <Input className="mt-1" value={cardPay} onChange={(e) => setCardPay(e.target.value)} required={pairCard} />
              </div>
            </div>
          ) : null}
          <label className="flex items-start gap-3 text-sm">
            <Switch checked={rights} onCheckedChange={setRights} />
            <span>{RIGHTS_TICK}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)} className="rounded-full">
              Back
            </Button>
            <Button type="submit" disabled={!rights || busy || !title || !ticker} className="rounded-full">
              {busy ? status ?? "Launching…" : `Launch · ${PAD_NAME} · Arc`}
            </Button>
          </div>
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
      ) : null}
    </form>
  );
}
