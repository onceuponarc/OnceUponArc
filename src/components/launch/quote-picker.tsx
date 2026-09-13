"use client";

import { useMemo, useState } from "react";
import { QUOTE_ASSETS, QUOTE_GROUPS, findQuote, type QuoteGroup } from "@onceupon/config/quotes";
import { QUOTE_DISCLAIMER } from "@onceupon/config/copy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function QuotePicker({
  group,
  quoteId,
  mint,
  onGroup,
  onQuoteId,
  onMint,
}: {
  group: QuoteGroup;
  quoteId: string;
  mint: string;
  onGroup: (group: QuoteGroup) => void;
  onQuoteId: (id: string) => void;
  onMint: (mint: string) => void;
}) {
  const [search, setSearch] = useState("");
  const selected = findQuote(quoteId);
  const options = useMemo(() => {
    const list = QUOTE_ASSETS.filter((item) => item.group === group);
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.symbol.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.mint?.toLowerCase().includes(q),
    );
  }, [group, search]);

  return (
    <section className="glass rounded-2xl border border-gold/20 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">3 · Pair liquidity</p>
      <p className="mt-2 text-sm text-parchment/65">{QUOTE_DISCLAIMER}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {QUOTE_GROUPS.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant={group === item.id ? "default" : "outline"}
            size="sm"
            onClick={() => {
              onGroup(item.id);
              if (item.id === "sol") onQuoteId("sol");
              if (item.id === "stable") onQuoteId("usdc");
              if (item.id === "stock") onQuoteId("aaplx");
              if (item.id === "treasury") onQuoteId("usdy");
              if (item.id === "custom") onQuoteId("custom");
              setSearch("");
            }}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <p className="mt-2 text-xs text-parchment/50">{QUOTE_GROUPS.find((item) => item.id === group)?.hint}</p>

      {group === "custom" ? (
        <div className="mt-4 space-y-2">
          <Label htmlFor="mint">Quote mint</Label>
          <Input
            id="mint"
            value={mint}
            onChange={(e) => onMint(e.target.value)}
            placeholder="Solana mint address"
          />
        </div>
      ) : group === "sol" ? (
        <p className="mt-4 text-sm text-parchment/70">Bonds until {selected?.graduationUi} SOL, then marks bonded.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {group === "stock" ? (
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search AAPLx, TSLAx, SPYx…"
            />
          ) : null}
          <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
            {options.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onQuoteId(item.id);
                  onMint(item.mint ?? "");
                }}
                className={cn(
                  "rounded-xl border p-3 text-left transition",
                  quoteId === item.id ? "border-gold bg-gold/15" : "border-gold/15 bg-white/5",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-heading font-bold">{item.symbol}</p>
                  <Badge variant="secondary">Listed</Badge>
                </div>
                <p className="mt-1 text-xs text-parchment/60">{item.name}</p>
                <p className="mt-1 text-[11px] text-parchment/45">
                  Bond at {item.graduationUi.toLocaleString("en-US")} {item.symbol}
                </p>
              </button>
            ))}
          </div>
          {options.length === 0 ? (
            <p className="text-sm text-parchment/60">No listed mint matches that search.</p>
          ) : null}
        </div>
      )}
    </section>
  );
}
