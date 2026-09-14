"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CHAPTER, chapterStartPriceUi, lpBaseReservedUi, tradableUi, virtualBaseUiFor, virtualQuoteUiFor } from "@onceupon/config/chapter";

export function TokenomicsFields({
  symbol,
  supplyUi,
  decimals,
  graduationUi,
  startCapUi,
  onSupply,
  onDecimals,
  onGraduation,
  onStartCap,
}: {
  symbol: string;
  supplyUi: number;
  decimals: number;
  graduationUi: number;
  startCapUi: number;
  onSupply: (value: number) => void;
  onDecimals: (value: number) => void;
  onGraduation: (value: number) => void;
  onStartCap: (value: number) => void;
}) {
  const virtualBase = virtualBaseUiFor(supplyUi);
  const virtualQuote = virtualQuoteUiFor({ startCapUi, virtualBaseUi: virtualBase, supplyUi });
  const start = chapterStartPriceUi(virtualQuote, virtualBase);
  const tradable = tradableUi(supplyUi);
  const reserved = lpBaseReservedUi(supplyUi);
  const progress = graduationUi > 0 ? Math.min(100, (0 / graduationUi) * 100) : 0;
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">Chapter Curve</p>
        <p className="mt-1 text-sm text-parchment/60">
          Locked at print. Supply mints to the vault. {CHAPTER.tradableBps / 100}% trades on the curve;{" "}
          {CHAPTER.lpReservedBps / 100}% is reserved for the book at graduation. Real quote starts at zero.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="supply">Supply</Label>
          <Input
            id="supply"
            type="number"
            min={1}
            max={1_000_000_000_000}
            value={supplyUi}
            onChange={(e) => onSupply(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="decimals">Decimals</Label>
          <Input
            id="decimals"
            type="number"
            min={0}
            max={9}
            value={decimals}
            onChange={(e) => onDecimals(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start-cap">Start cap ({symbol})</Label>
          <Input
            id="start-cap"
            type="number"
            min={0}
            step="any"
            value={startCapUi}
            onChange={(e) => onStartCap(Number(e.target.value))}
          />
          <p className="text-[11px] text-parchment/50">
            Sets virtual quote so the first print is cheap, not free. Virtual {symbol} ≈{" "}
            {virtualQuote.toLocaleString("en-US", { maximumFractionDigits: 4 })}.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="grad">Graduate target ({symbol})</Label>
          <input
            id="grad"
            type="range"
            min={0}
            max={Math.max(startCapUi * 8, graduationUi * 2, 1)}
            step={symbol.toUpperCase().includes("USD") ? 50 : "any"}
            value={graduationUi}
            onChange={(e) => onGraduation(Number(e.target.value))}
            className="w-full accent-[#3ee0c6]"
          />
          <Input
            type="number"
            min={0}
            step="any"
            value={graduationUi}
            onChange={(e) => onGraduation(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-arc" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-sm text-parchment/70">
        Start price ≈ {start ? start.toPrecision(4) : "0"} {symbol} per token · {tradable.toLocaleString("en-US")}{" "}
        tradable · {reserved.toLocaleString("en-US")} reserved for the book · {decimals} decimals
      </p>
      <p className="text-xs text-parchment/55">
        Preview to target: buyers fill {graduationUi.toLocaleString("en-US")} {symbol} into the vault. The Author does
        not deposit inventory. Buyers can sell anytime. Remaining {symbol} in the book seeds the graduated pool.
      </p>
    </div>
  );
}
