"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { startingPriceUi } from "@/lib/solana/tokenomics";

export function TokenomicsFields({
  symbol,
  supplyUi,
  decimals,
  graduationUi,
  virtualUi,
  onSupply,
  onDecimals,
  onGraduation,
  onVirtual,
}: {
  symbol: string;
  supplyUi: number;
  decimals: number;
  graduationUi: number;
  virtualUi: number;
  onSupply: (value: number) => void;
  onDecimals: (value: number) => void;
  onGraduation: (value: number) => void;
  onVirtual: (value: number) => void;
}) {
  const start = startingPriceUi(virtualUi, supplyUi);
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">Tokenomics</p>
        <p className="mt-1 text-sm text-parchment/60">
          Locked at print. Supply mints to the curve. Start price is virtual {symbol} ÷ supply.
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
          <Label htmlFor="virtual">Virtual {symbol} (start depth)</Label>
          <Input
            id="virtual"
            type="number"
            min={0}
            step="any"
            value={virtualUi}
            onChange={(e) => onVirtual(Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grad">Bond target ({symbol})</Label>
          <Input
            id="grad"
            type="number"
            min={0}
            step="any"
            value={graduationUi}
            onChange={(e) => onGraduation(Number(e.target.value))}
          />
        </div>
      </div>
      <p className="text-sm text-parchment/70">
        Start price ≈ {start ? start.toPrecision(4) : "0"} {symbol} per token · {supplyUi.toLocaleString("en-US")}{" "}
        units · {decimals} decimals
      </p>
    </div>
  );
}
