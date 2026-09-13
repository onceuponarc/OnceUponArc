"use client";

import { useMemo, useState } from "react";
import { QUOTE_ASSETS, QUOTE_GROUPS, findQuote, type QuoteGroup } from "@onceupon/config/quotes";
import { QUOTE_DISCLAIMER } from "@onceupon/config/copy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const GROUP_DEFAULT: Partial<Record<QuoteGroup, string>> = {
  sol: "sol",
  btc: "cbbtc",
  stable: "usdc",
  meme: "bonk",
  stock: "nvdax",
  etf: "spyx",
  treasury: "usdy",
  bond: "ousg",
  custom: "custom",
};

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
    <section className="glass rounded-2xl border border-arc/20 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">3 · Quote (Chapter settles in this mint)</p>
      <p className="mt-2 text-sm text-parchment/65">{QUOTE_DISCLAIMER}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {QUOTE_GROUPS.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant={group === item.id ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => {
              onGroup(item.id);
              const next = GROUP_DEFAULT[item.id];
              if (next) onQuoteId(next);
              const listed = next ? findQuote(next) : undefined;
              onMint(listed?.mint ?? "");
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
          <Label htmlFor="mint">Any SPL mint</Label>
          <Input
            id="mint"
            value={mint}
            onChange={(e) => onMint(e.target.value)}
            placeholder="Paste a mint — BTC wrap, meme, stock, anything on-chain"
          />
        </div>
      ) : group === "sol" ? (
        <p className="mt-4 text-sm text-parchment/70">
          Bonds until {selected?.graduationUi} SOL, then marks bonded. You pair into SOL depth — you do not seed an empty pool.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {options.length > 6 ? (
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                group === "stock"
                  ? "Search NVDAx, AAPLx, TSLAx…"
                  : group === "etf"
                    ? "Search SPYx, QQQx…"
                    : "Search a listed mint"
              }
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
                  quoteId === item.id ? "border-arc bg-arc/15" : "border-white/10 bg-white/5",
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
            <p className="text-sm text-parchment/60">No listed mint matches that search. Paste any mint under Any mint.</p>
          ) : null}
        </div>
      )}
    </section>
  );
}
