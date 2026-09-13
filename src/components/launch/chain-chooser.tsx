import Link from "next/link";
import { CHAINS } from "@onceupon/config/solana";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function ChainChooser({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("grid gap-3", compact ? "sm:grid-cols-2 lg:grid-cols-5" : "sm:grid-cols-2 lg:grid-cols-3")}>
      {CHAINS.map((chain) => (
        <Link
          key={chain.id}
          href={`/launch/${chain.id}`}
          className={cn(
            "glass relative overflow-hidden rounded-2xl border p-4 text-left transition hover:-translate-y-0.5",
            chain.live ? "border-gold/25 hover:border-gold/55" : "border-gold/10 hover:border-gold/30",
          )}
        >
          <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80", chain.accent)} />
          <div className="relative">
            <div className="flex items-start justify-between gap-2">
              <p className="font-heading text-lg font-bold sm:text-xl">{chain.title}</p>
              <Badge variant={chain.live ? "default" : "outline"}>{chain.badge}</Badge>
            </div>
            <p className="mt-2 text-sm text-parchment/75">{chain.body}</p>
            <p className="mt-3 text-xs font-medium text-gold">
              {chain.live
                ? chain.id === "solana"
                  ? "Open the Solana press →"
                  : `Launch tagged for ${chain.title} →`
                : "See why it is closed →"}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
