import Link from "next/link";
import { LAUNCH_TYPES, PAIR_TYPES } from "@onceupon/config/copy";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function LaunchTypeGrid({
  detailed = false,
}: {
  detailed?: boolean;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {LAUNCH_TYPES.map((type) => (
        <article
          key={type.id}
          className={cn(
            "glass rounded-2xl border p-5",
            type.id === "rwa" ? "border-gold/30" : "border-gold/20",
            type.id === "author" && "hover:border-gold/50",
            type.id === "onceuponers" && "hover:border-teal/50",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
              {type.title}
            </p>
            <Badge variant={type.id === "rwa" ? "secondary" : "outline"}>{type.badge}</Badge>
          </div>
          <h3 className="font-heading mt-2 text-2xl font-bold">{type.headline}</h3>
          <p className="mt-2 text-sm text-parchment/70">{type.summary}</p>
          {detailed ? (
            <ol className="mt-4 list-decimal space-y-2 pl-4 text-sm text-parchment/75">
              {type.how.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function PairStrip() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {PAIR_TYPES.map((pair) => (
        <div
          key={pair.id}
          className={cn(
            "glass rounded-2xl border p-4",
            pair.listed ? "border-gold/20" : "border-burgundy/35",
          )}
        >
          <div className="flex items-center justify-between">
            <p className="font-heading text-lg font-semibold">{pair.label}</p>
            <Badge variant={pair.listed ? "secondary" : "destructive"}>
              {pair.listed ? "Listed" : "Gated"}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-parchment/65">{pair.body}</p>
        </div>
      ))}
    </div>
  );
}

export function LaunchTypeStrip() {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Engines</p>
          <h2 className="font-heading mt-1 text-2xl font-bold">How you launch</h2>
        </div>
        <Link href="/launch" className="text-sm text-gold hover:underline">
          Full breakdown
        </Link>
      </div>
      <LaunchTypeGrid />
    </section>
  );
}
