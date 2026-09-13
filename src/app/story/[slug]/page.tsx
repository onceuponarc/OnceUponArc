import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CurveTrade } from "@/components/pad/curve-trade";
import { JupiterSwapPanel } from "@/components/jupiter/swap-panel";
import { PIECE_EXPLAINER, AUTHOR_FEE_EXPLAINER } from "@onceupon/config/copy";
import { findChain, SOLANA } from "@onceupon/config/solana";
import { notFound } from "next/navigation";
import Link from "next/link";
import { tickerHue } from "@/lib/feed";
import { explorerAddress, explorerTx } from "@/lib/solana/explorer";

const STORY_SELECT =
  "id, title, ticker, blurb, engine, status, pair_label, author_bps, protocol_bps, vault_address, token_address, chain, venue, mint_decimals, created_tx, curve_quote_lamports, auto_buy_rewards, quote_decimals, graduation_quote_raw, author_user_id, users:author_user_id(handle, display_name, portrait_url)";

async function loadStory(slug: string) {
  const supabase = await createClient();
  const { data: story } = await supabase.from("stories").select(STORY_SELECT).eq("slug", slug).maybeSingle();
  if (!story) return { story: null, bindings: [] as BindingRow[] };
  const { data: bindings } = await supabase
    .from("bindings")
    .select("id, kind, chain_caip2, pool_address, mechanism, is_primary, proof_url")
    .eq("story_id", story.id)
    .order("is_primary", { ascending: false });
  return { story, bindings: bindings ?? [] };
}

type BindingRow = {
  id: string;
  kind: string;
  chain_caip2: string;
  pool_address: string;
  mechanism: string | null;
  is_primary: boolean;
  proof_url: string | null;
};

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
  const { profile } = await getSessionUser();
  let story: Awaited<ReturnType<typeof loadStory>>["story"] = null;
  let bindings: Awaited<ReturnType<typeof loadStory>>["bindings"] = [];
  try {
    const loaded = await loadStory(slug);
    story = loaded.story;
    bindings = loaded.bindings;
  } catch (error) {
    console.error("Story load failed", error);
    return (
      <div className="glass mx-auto max-w-lg space-y-3 rounded-3xl border border-gold/25 p-8">
        <h1 className="font-heading text-3xl font-bold">This Story could not load</h1>
        <p className="text-parchment/70">Supabase did not answer. Reload, then sign in with X if you were trading.</p>
      </div>
    );
  }

  if (!story) notFound();

  const author = Array.isArray(story.users) ? story.users[0] : story.users;
  const hue = tickerHue(story.ticker);
  const engineLabel = story.engine === "author" ? "Author" : "OnceUponers";
  const statusLabel = story.status === "graduated" ? "Bonded" : story.status;
  const chain = story.chain ?? "solana";
  const chainCard = findChain(chain);
  const isAuthor = Boolean(profile && story.author_user_id === profile.id);

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
            <Badge variant="outline">{chainCard?.title ?? chain}</Badge>
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
              Curve{" "}
              {(Number(story.curve_quote_lamports ?? 0) / 10 ** Number(story.quote_decimals ?? 9)).toLocaleString(
                "en-US",
                { maximumFractionDigits: 4 },
              )}{" "}
              /{" "}
              {(
                Number(story.graduation_quote_raw ?? SOLANA.bondingGraduationSol * 1_000_000_000) /
                10 ** Number(story.quote_decimals ?? 9)
              ).toLocaleString("en-US")}{" "}
              {story.pair_label}
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
          <CardDescription>
            Bonding buys use the pad curve. After a route exists, Jupiter quotes the mint and your connected
            Solana wallet signs the swap.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {story.status !== "graduated" ? (
            <CurveTrade
              slug={slug}
              venue={story.venue ?? "spl"}
              engine={story.engine}
              pairLabel={story.pair_label}
              decimals={Number(story.mint_decimals ?? 6)}
              quoteDecimals={Number(story.quote_decimals ?? 9)}
            />
          ) : (
            <p className="text-sm text-parchment/70">This Story bonded. Spot now routes through Jupiter.</p>
          )}
          {story.token_address ? (
            <JupiterSwapPanel
              signedIn={Boolean(profile)}
              title={`Jupiter · $${story.ticker}`}
              extraMint={story.token_address}
              extraSymbol={story.ticker}
              extraDecimals={Number(story.mint_decimals ?? 6)}
              defaultOutput={story.ticker}
            />
          ) : (
            <p className="text-sm text-parchment/60">Jupiter can quote this mint once the printer lands it.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>The Binding</CardTitle>
          <CardDescription>
            Primary liquidity is the Solana curve. Foreign pools are records the Author attaches after launch.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {!bindings?.length ? (
            <p className="text-parchment/65">No pool bindings yet. The mint is on Solana mainnet.</p>
          ) : (
            <ul className="space-y-2">
              {bindings.map((binding) => (
                <li key={binding.id} className="rounded-xl border border-gold/15 bg-black/20 px-3 py-2">
                  <p className="font-medium text-parchment">
                    {binding.is_primary ? "Primary · " : "Linked · "}
                    {binding.kind.replaceAll("_", " ")} · {binding.chain_caip2}
                  </p>
                  <p className="break-all text-xs text-parchment/60">{binding.pool_address}</p>
                  {binding.mechanism ? <p className="text-xs text-parchment/50">{binding.mechanism}</p> : null}
                </li>
              ))}
            </ul>
          )}
          {isAuthor ? (
            <Button asChild size="sm">
              <Link href="/bindings">Bind a foreign pool</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
