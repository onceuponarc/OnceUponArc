import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { tickerHue, type FeedLaunch } from "@/lib/feed";
import { cn } from "@/lib/utils";

function statusLabel(status: FeedLaunch["status"]) {
  if (status === "graduated") return "Bonded";
  if (status === "live") return "Live";
  if (status === "draft") return "Draft";
  return status;
}

export function LaunchCard({ launch }: { launch: FeedLaunch }) {
  const hue = tickerHue(launch.ticker);
  const engineLabel = launch.engine === "author" ? "Author" : "OnceUponers";

  return (
    <Link href={`/story/${launch.slug}`} className="group block h-full">
      <article className="glass flex h-full flex-col overflow-hidden rounded-2xl border border-gold/20 transition duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_0_40px_rgb(201_162_39_/_18%)]">
        <div
          className="relative h-28 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, hsl(${hue} 48% 16%), hsl(${(hue + 48) % 360} 55% 28%), hsl(${(hue + 170) % 360} 32% 12%))`,
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgb(246_239_226_/_18%),transparent_45%)]" />
          <div className="absolute inset-x-4 bottom-3 flex items-end justify-between">
            <p className="font-heading text-3xl font-bold tracking-tight text-white drop-shadow">
              ${launch.ticker}
            </p>
            <Badge className="bg-ink/70 text-gold backdrop-blur">{statusLabel(launch.status)}</Badge>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <h3 className="font-heading text-lg font-semibold leading-tight group-hover:text-gold">
              {launch.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-parchment/65">
              {launch.blurb || "A launch on Arc."}
            </p>
          </div>
          <div className="mt-auto flex flex-wrap items-center gap-1.5">
            <Badge variant="outline">{engineLabel}</Badge>
            <Badge variant="secondary">{launch.pairLabel}</Badge>
            <span className="text-xs text-gold/90">{(launch.authorBps / 100).toFixed(2)}% author</span>
          </div>
          {launch.handle ? (
            <p className="text-xs text-parchment/50">@{launch.handle}</p>
          ) : null}
        </div>
      </article>
    </Link>
  );
}

export function EmptyPad({
  title,
  body,
  className,
}: {
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass rounded-2xl border border-dashed border-gold/25 px-6 py-14 text-center",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">The pad is open</p>
      <h3 className="font-heading mt-3 text-2xl font-bold">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-parchment/65">{body}</p>
    </div>
  );
}
