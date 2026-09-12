import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurveTrade } from "@/components/pad/curve-trade";
import { PIECE_EXPLAINER, AUTHOR_FEE_EXPLAINER } from "@onceupon/config/copy";
import { SOLANA } from "@onceupon/config/solana";
import { notFound } from "next/navigation";
import Link from "next/link";
import { tickerHue } from "@/lib/feed";
import { explorerAddress, explorerTx } from "@/lib/solana/connection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: slug };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: story } = await supabase
    .from("stories")
    .select(
      "title, ticker, blurb, engine, status, pair_label, author_bps, protocol_bps, vault_address, token_address, chain, venue, mint_decimals, created_tx, curve_quote_lamports, auto_buy_rewards, users:author_user_id(handle, display_name, portrait_url)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!story) notFound();
  const author = Array.isArray(story.users) ? story.users[0] : story.users;
  const hue = tickerHue(story.ticker);
  const engineLabel = story.engine === "author" ? "Author" : "OnceUponers";
  const statusLabel = story.status === "graduated" ? "Bonded" : story.status;
  const chain = story.chain ?? "solana";

  return (
    <div className="space-y-8">
      <section
        className="relative overflow-hidden rounded-3xl border border-gold/25 p-6 sm:p-10"
        style={{
          background: `linear-gradient(135deg, hsl(${hue} 40% 12% / 0.9), rgb(11 10 18 / 0.7))`,
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgb(201_162_39_/_25%),transparent_40%)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">${story.ticker}</p>
            <h1 className="font-heading mt-2 text-4xl font-extrabold sm:text-5xl">{story.title}</h1>
            <p className="mt-3 max-w-2xl text-parchment/75">{story.blurb}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{engineLabel}</Badge>
            <Badge variant="outline">{story.venue ?? "spl"}</Badge>
            <Badge variant="outline">{story.pair_label}</Badge>
            <Badge variant="secondary">{statusLabel}</Badge>
            <Badge variant="outline">{chain}</Badge>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fees</CardTitle>
            <CardDescription>
              {story.engine === "author" ? AUTHOR_FEE_EXPLAINER : PIECE_EXPLAINER}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              Author {(story.author_bps / 100).toFixed(2)}% · protocol{" "}
              {(story.protocol_bps / 100).toFixed(2)}%
            </p>
            <p>Quote {story.pair_label}</p>
            {story.auto_buy_rewards ? <p>Vault auto-buys the pair on each OnceUponers cut.</p> : null}
            {story.engine === "onceuponers" ? (
              <p>Vault {story.vault_address ?? "n/a"}</p>
            ) : (
              <p>No claim button. Fees push on each swap.</p>
            )}
            {story.token_address ? (
              <p>
                Mint{" "}
                <a
                  className="break-all text-gold hover:underline"
                  href={explorerAddress(story.token_address)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {story.token_address}
                </a>
              </p>
            ) : null}
            {story.created_tx ? (
              <p>
                <a className="text-gold hover:underline" href={explorerTx(story.created_tx)} target="_blank" rel="noreferrer">
                  Launch transaction
                </a>
              </p>
            ) : null}
            <p>
              Curve {Number(story.curve_quote_lamports ?? 0) / 1_000_000_000} / {SOLANA.bondingGraduationSol} SOL
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Author</CardTitle>
          </CardHeader>
          <CardContent>
            {author && "handle" in author ? (
              <Link href={`/shelf/${author.handle}`} className="text-gold hover:underline">
                @{String(author.handle)}
              </Link>
            ) : (
              <p>Unknown OnceUponer</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trade</CardTitle>
          <CardDescription>Real Solana devnet buys and sells from your pad wallet.</CardDescription>
        </CardHeader>
        <CardContent>
          <CurveTrade
            slug={slug}
            venue={story.venue ?? "spl"}
            engine={story.engine}
            pairLabel={story.pair_label}
            decimals={Number(story.mint_decimals ?? 6)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
