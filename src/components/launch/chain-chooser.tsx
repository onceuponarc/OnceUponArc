import Link from "next/link";
import { CHAINS } from "@onceupon/config/solana";
import { CHAIN_POOLS } from "@onceupon/config/pools";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ChainChooser({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("grid gap-3", compact ? "grid-cols-2 lg:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-3")}>
      {CHAINS.map((chain) => {
        const catalog = CHAIN_POOLS[chain.id];
        return (
          <Link
            key={chain.id}
            href={`/launch/${chain.id}`}
            className={cn(
              "glass relative overflow-hidden rounded-2xl border p-4 text-left transition hover:-translate-y-0.5",
              chain.id === "arc" ? "border-arc/40 hover:border-arc/70" : "border-white/10 hover:border-arc/40",
            )}
          >
            <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80", chain.accent)} />
            <div className="relative">
              <div className="flex items-start justify-between gap-2">
                <p className="font-heading text-lg font-bold sm:text-xl">{chain.title}</p>
                <Badge variant={chain.id === "arc" ? "default" : "outline"}>{chain.badge}</Badge>
              </div>
              <p className="mt-2 text-sm text-parchment/75">{chain.body}</p>
              <p className="mt-2 text-[11px] text-parchment/50">
                {catalog.factories.map((item) => item.name).join(" · ") || "OnceUpon curve"}
              </p>
              <p className="mt-3 text-xs font-medium text-arc">
                {chain.id === "arc"
                  ? "Open the Arc press →"
                  : chain.id === "solana"
                    ? "Print on Solana mainnet →"
                    : `Launch tagged for ${chain.title} →`}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
