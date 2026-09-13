"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SOLANA } from "@onceupon/config/solana";
import {
  canonicalPoolsForQuote,
  catalogFor,
  createLpLinks,
  type DexId,
} from "@onceupon/config/pools";
import { findQuote, findQuoteByMint } from "@onceupon/config/quotes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PoolPicker, type LinkedPoolPick } from "@/components/launch/pool-picker";
import { SolanaConnectButton } from "@/components/wallet/connect-button";
import { useWalletSigner } from "@/components/wallet/use-wallet-signer";
import { fetchLaunchBlockhash } from "@/lib/solana/blockhash";
import { readApiJson } from "@/lib/http/read-json";

function defaultQuoteUi(symbol: string) {
  const upper = symbol.toUpperCase();
  if (upper === "SOL" || upper === "WSOL") return "0.5";
  if (upper.includes("USD")) return "50";
  return "0.25";
}

function quoteOptions(storyMint: string | null, pairLabel: string) {
  const listed = findQuoteByMint(storyMint) ?? findQuote("sol");
  const story = {
    mint: storyMint || SOLANA.wsolMint,
    symbol: listed?.symbol ?? pairLabel ?? "SOL",
  };
  const extras = [
    { mint: SOLANA.wsolMint, symbol: "SOL" },
    { mint: SOLANA.usdcMint, symbol: "USDC" },
  ];
  const out = [story];
  for (const extra of extras) {
    if (out.some((item) => item.mint === extra.mint)) continue;
    out.push(extra);
  }
  return out;
}

export function LinkLp({
  slug,
  ticker,
  tokenMint,
  quoteMint,
  pairLabel,
  boundAddresses,
  venue = "spl",
  curveTokenRaw = "0",
  mintDecimals = 6,
}: {
  slug: string;
  ticker: string;
  tokenMint: string | null;
  quoteMint: string | null;
  pairLabel: string;
  boundAddresses: string[];
  venue?: string;
  curveTokenRaw?: string | number | null;
  mintDecimals?: number;
}) {
  const router = useRouter();
  const { address, signAndSend, ensureBound } = useWalletSigner();
  const listed = findQuoteByMint(quoteMint) ?? findQuote("sol");
  const quoteId = listed?.id ?? "sol";
  const quoteSymbol = listed?.symbol ?? pairLabel ?? "SOL";
  const canonical = canonicalPoolsForQuote(quoteId);
  const catalog = catalogFor("solana");
  const options = useMemo(() => quoteOptions(quoteMint, pairLabel), [quoteMint, pairLabel]);
  const [pairQuote, setPairQuote] = useState(options[0]?.mint ?? SOLANA.wsolMint);
  const pairQuoteMeta = options.find((item) => item.mint === pairQuote) ?? options[0];
  const [quoteAmount, setQuoteAmount] = useState(defaultQuoteUi(pairQuoteMeta?.symbol ?? quoteSymbol));
  const [basePct, setBasePct] = useState("80");
  const [pool, setPool] = useState<LinkedPoolPick | null>(
    canonical[0]
      ? {
          address: canonical[0].address,
          dex: canonical[0].dex,
          label: canonical[0].label,
          url: canonical[0].url,
          chain: "solana",
          depthUsd: canonical[0].liquidityUsd,
          quoteAddress: quoteMint,
        }
      : null,
  );
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const lpLinks = useMemo(
    () => (tokenMint ? createLpLinks(tokenMint, pairQuote || quoteMint) : []),
    [tokenMint, pairQuote, quoteMint],
  );

  const curveUi = Number(curveTokenRaw ?? 0) / 10 ** mintDecimals;
  const seedUi = curveUi * (Number(basePct) / 100);
  const quoteUi = Number(quoteAmount);
  const startPrice = seedUi > 0 && quoteUi > 0 ? quoteUi / seedUi : 0;

  async function bind(pick: LinkedPoolPick) {
    setBusy(true);
    setError(null);
    setOk(null);
    setStatus(null);
    try {
      const res = await fetch("/api/bindings/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storySlug: slug,
          chainCaip2: catalog.caip2,
          poolAddress: pick.address,
          mechanism: pick.dex,
          proofUrl: pick.url || undefined,
          depthUsd: pick.depthUsd,
          quoteAddress: pick.quoteAddress ?? quoteMint,
          label: pick.label,
        }),
      });
      const body = await readApiJson<{ error?: string; label?: string }>(res);
      if (!res.ok) {
        setError(body.error ?? "Could not bind that pool.");
        return;
      }
      setOk(`Bound ${body.label ?? pick.label}. That tags quote depth. It does not deposit your mint.`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not bind that pool.");
    } finally {
      setBusy(false);
    }
  }

  async function pairOnPumpSwap() {
    if (!address) {
      setError("Connect a Solana wallet first.");
      return;
    }
    if (!tokenMint) {
      setError("Mint is not on-chain yet. Finish sign-and-pay print first.");
      return;
    }
    const quote = Number(quoteAmount);
    const pct = Number(basePct);
    if (!(quote > 0)) {
      setError(`Deposit more than zero ${pairQuoteMeta?.symbol ?? "quote"}.`);
      return;
    }
    if (!(pct >= 1 && pct <= 95)) {
      setError("Seed between 1% and 95% of the remaining curve tokens.");
      return;
    }
    setBusy(true);
    setError(null);
    setOk(null);
    try {
      setStatus("Bind this wallet to your X account…");
      const payer = await ensureBound();
      setStatus("Fetching a Solana blockhash…");
      const latest = await fetchLaunchBlockhash();
      setStatus("Building PumpSwap create_pool…");
      const res = await fetch(`/api/stories/${slug}/pair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payer,
          quoteMint: pairQuote,
          quoteUi: quote,
          baseBps: Math.round(pct * 100),
          recentBlockhash: latest.blockhash,
        }),
      });
      const body = await readApiJson<{
        error?: string;
        already?: boolean;
        transactions?: string[];
        transaction?: string;
        pool?: string;
        quoteMint?: string;
        explorer?: string;
        proofUrl?: string;
      }>(res);
      if (!res.ok) {
        setError(body.error ?? "Could not build the PumpSwap pool.");
        return;
      }
      if (!body.pool) {
        setError("The pad did not return a pool address.");
        return;
      }
      const txs =
        Array.isArray(body.transactions) && body.transactions.length
          ? body.transactions
          : body.transaction
            ? [body.transaction]
            : [];
      let sent = { signature: "", explorer: "" };
      if (!body.already) {
        if (!txs.length) {
          setError("The pad did not return a transaction to sign and pay.");
          return;
        }
        for (let i = 0; i < txs.length; i += 1) {
          setStatus(
            txs.length > 1
              ? `Sign and pay transaction ${i + 1} of ${txs.length} in your wallet…`
              : "Sign and pay create_pool in your wallet. This spends gas and deposits quote.",
          );
          sent = await signAndSend(txs[i]);
          if (i < txs.length - 1) {
            setStatus("Waiting for the seed to land on Solana…");
            const waitRes = await fetch(`/api/stories/${slug}/pair`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "wait", signature: sent.signature }),
            });
            const waited = await readApiJson<{ error?: string }>(waitRes);
            if (!waitRes.ok) {
              setError(waited.error ?? "Seed landed in the wallet but the pad could not confirm it. Retry.");
              return;
            }
          }
        }
      }
      setStatus("Confirming the PumpSwap pool…");
      const confirm = await fetch(`/api/stories/${slug}/pair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm",
          signature: sent.signature || "existing",
          pool: body.pool,
          quoteMint: body.quoteMint ?? pairQuote,
        }),
      });
      const confirmed = await readApiJson<{ error?: string; explorer?: string; proofUrl?: string; label?: string }>(
        confirm,
      );
      if (!confirm.ok) {
        setError(confirmed.error ?? "Pool may have landed. Check the explorer, then refresh.");
        setOk(body.proofUrl ?? sent.explorer);
        return;
      }
      setOk(
        `${confirmed.label ?? "PumpSwap pool"} is on-chain. DexScreener and Jupiter index it from the pool account, not from a bind click.`,
      );
      setStatus(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open PumpSwap LP.");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
  }

  const already = new Set(boundAddresses.map((item) => item.toLowerCase()));
  const quoteDepthBound = canonical.some((item) => already.has(item.address.toLowerCase()));
  const nft = venue === "nft";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-parchment/70">
        <p className="font-medium text-parchment">
          Quote is {quoteSymbol}
          {listed?.group === "stock" || listed?.group === "etf" ? " · quote pair, not studio equity" : ""}
        </p>
        <p className="mt-1">
          The OnceUpon curve is off-chain math plus a token vault. DexScreener and Jupiter need a real AMM with both
          sides deposited. PumpSwap <span className="font-mono text-[11px]">create_pool</span> does that: your wallet
          signs, pays rent and gas, and deposits {pairQuoteMeta?.symbol ?? quoteSymbol}. The curve vault moves the
          base tokens.
        </p>
        {tokenMint ? (
          <p className="mt-2 break-all font-mono text-[11px] text-parchment/50">Your mint · {tokenMint}</p>
        ) : (
          <p className="mt-2 text-burgundy">Mint is not on-chain yet. Finish sign-and-pay first.</p>
        )}
        {quoteMint ? (
          <p className="mt-1 break-all font-mono text-[11px] text-parchment/50">
            {quoteSymbol} mint · {quoteMint}
          </p>
        ) : (
          <p className="mt-1 break-all font-mono text-[11px] text-parchment/50">SOL mint · {SOLANA.wsolMint}</p>
        )}
      </div>

      {nft ? (
        <p className="text-sm text-parchment/70">NFTs do not open a PumpSwap pool.</p>
      ) : (
        <div className="space-y-3 rounded-xl border border-arc/25 bg-arc/5 p-3">
          <p className="text-sm font-medium text-parchment">1 · Sign and pay PumpSwap LP</p>
          <p className="text-xs text-parchment/55">
            Same shape as Pump.fun pairing into PumpSwap with SOL or USDC — plus any quote this Story launched
            against. Permissionless PumpSwap LP fee is 0.25% and protocol is 0.05%. That is not Pump.fun’s bonding-curve
            schedule.
          </p>
          {!address ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-arc/20 bg-black/20 px-3 py-2">
              <p className="text-sm text-parchment/70">Connect the wallet that will pay rent and deposit quote.</p>
              <SolanaConnectButton compact />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {options.map((option) => (
              <Button
                key={option.mint}
                type="button"
                size="sm"
                variant={pairQuote === option.mint ? "default" : "outline"}
                disabled={busy}
                onClick={() => {
                  setPairQuote(option.mint);
                  setQuoteAmount(defaultQuoteUi(option.symbol));
                }}
              >
                Pair vs {option.symbol}
              </Button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quote-in">{pairQuoteMeta?.symbol ?? "Quote"} to deposit</Label>
              <Input
                id="quote-in"
                inputMode="decimal"
                value={quoteAmount}
                disabled={busy}
                onChange={(event) => setQuoteAmount(event.target.value)}
              />
              <p className="text-[11px] text-parchment/50">
                {pairQuoteMeta?.mint === SOLANA.wsolMint
                  ? "Pulled from your SOL balance (wrapped in the same transaction)."
                  : `Your wallet must already hold this ${pairQuoteMeta?.symbol}.`}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="base-pct">Curve tokens into the pool (%)</Label>
              <Input
                id="base-pct"
                inputMode="numeric"
                value={basePct}
                disabled={busy}
                onChange={(event) => setBasePct(event.target.value)}
              />
              <p className="text-[11px] text-parchment/50">
                {seedUi > 0
                  ? `~${seedUi.toLocaleString("en-US", { maximumFractionDigits: 2 })} $${ticker} from the vault. ${100 - Number(basePct || 0)}% stays on the curve.`
                  : "Reads the live curve vault when you sign."}
              </p>
            </div>
          </div>
          {startPrice > 0 ? (
            <p className="text-xs text-parchment/60">
              Opening price ≈ {startPrice.toLocaleString("en-US", { maximumFractionDigits: 8 })}{" "}
              {pairQuoteMeta?.symbol} per ${ticker}
            </p>
          ) : null}
          <Button type="button" disabled={busy || !tokenMint || !address} onClick={() => void pairOnPumpSwap()}>
            {busy ? status ?? "Signing…" : `Sign and pay to open $${ticker}/${pairQuoteMeta?.symbol} PumpSwap`}
          </Button>
          {status && busy ? <p className="text-xs text-parchment/55">{status}</p> : null}
        </div>
      )}

      {canonical.length ? (
        <div className="space-y-2">
          <p className="text-sm font-medium text-parchment">2 · Optional · tag quote depth</p>
          <p className="text-xs text-parchment/55">
            {canonical[0].label} is the live {quoteSymbol} market. Binding it labels this Story. It does not put $
            {ticker} in that pool.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{canonical[0].dex}</Badge>
            <span className="font-mono text-[11px] text-parchment/50">
              {canonical[0].address.slice(0, 6)}…{canonical[0].address.slice(-4)}
            </span>
            {quoteDepthBound ? (
              <Badge>Already bound</Badge>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={busy || !tokenMint}
                onClick={() =>
                  void bind({
                    address: canonical[0].address,
                    dex: canonical[0].dex as DexId,
                    label: canonical[0].label,
                    url: canonical[0].url,
                    chain: "solana",
                    depthUsd: canonical[0].liquidityUsd,
                    quoteAddress: quoteMint,
                  })
                }
              >
                {busy ? "Binding…" : `Tag ${canonical[0].label}`}
              </Button>
            )}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <p className="text-sm font-medium text-parchment">3 · Other AMMs</p>
        <p className="text-xs text-parchment/55">
          Raydium, Meteora, or Orca if you want a second venue. You still pay liquidity there. Paste that pool below
          after it exists.
        </p>
        <div className="flex flex-wrap gap-2">
          {tokenMint ? (
            <Button type="button" size="sm" variant="outline" onClick={() => void copy(tokenMint)}>
              Copy your mint
            </Button>
          ) : null}
          {quoteMint ? (
            <Button type="button" size="sm" variant="outline" onClick={() => void copy(quoteMint)}>
              Copy {quoteSymbol} mint
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={() => void copy(SOLANA.usdcMint)}>
            Copy USDC mint
          </Button>
          {lpLinks.map((link) => (
            <Button key={link.id} asChild size="sm" variant="outline">
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.name}
              </a>
            </Button>
          ))}
        </div>
      </div>

      <PoolPicker
        chain="solana"
        quoteId={quoteId}
        mint={quoteMint || ""}
        selected={pool}
        onSelect={setPool}
        heading="4 · Paste a pool that already exists"
      />

      <Button
        type="button"
        variant="outline"
        disabled={busy || !pool?.address || !tokenMint}
        onClick={() => pool && void bind(pool)}
      >
        {busy ? "Binding…" : pool ? `Tag ${pool.label}` : "Pick a pool"}
      </Button>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Pair blocked</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {ok ? (
        <Alert>
          <AlertTitle>Liquidity</AlertTitle>
          <AlertDescription>{ok}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
