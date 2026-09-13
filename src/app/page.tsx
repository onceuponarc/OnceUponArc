import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeedBoard } from "@/components/pad/feed-board";
import { LaunchTypeStrip } from "@/components/pad/launch-types";
import { ChainChooser } from "@/components/launch/chain-chooser";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { SOLANA } from "@onceupon/config/solana";
import { ARC_TESTNET, PROTOCOL } from "@onceupon/config/arc";
import { BONDING_COPY, PAD_TAGLINE, QUOTE_DISCLAIMER } from "@onceupon/config/copy";
import type { FeedLaunch } from "@/lib/feed";
import Link from "next/link";
import { JupiterStatusRow } from "@/components/jupiter/status-row";

function mapStory(row: {
  slug: string;
  title: string;
  ticker: string;
  blurb: string | null;
  engine: "author" | "onceuponers";
  pair_label: string;
  author_bps: number;
  cover_url: string | null;
  status: FeedLaunch["status"];
  created_at: string;
  chain?: string | null;
  venue?: string | null;
  users:
    | { handle: string }
    | { handle: string }[]
    | null;
}): FeedLaunch {
  const author = Array.isArray(row.users) ? row.users[0] : row.users;
  return {
    slug: row.slug,
    title: row.title,
    ticker: row.ticker,
    blurb: row.blurb ?? "",
    engine: row.engine,
    pairLabel: row.pair_label,
    authorBps: row.author_bps,
    status: row.status,
    coverUrl: row.cover_url,
    handle: author && "handle" in author ? String(author.handle) : null,
    createdAt: row.created_at,
    chain: row.chain ?? "solana",
    venue: row.venue ?? "spl",
  };
}

export default async function HomePage() {
  const { profile } = await getSessionUser();
  let chapter: { slug: string; title: string; opens_at: string | null } | null = null;
  let stories: Parameters<typeof mapStory>[0][] | null = null;
  try {
    const supabase = await createClient();
    const [{ data: chapterRow }, { data: storyRows }] = await Promise.all([
      supabase.from("chapters").select("slug, title, opens_at").eq("slug", "the-first-chapter").maybeSingle(),
      supabase
        .from("stories")
        .select(
          "slug, title, ticker, blurb, engine, pair_label, author_bps, cover_url, status, created_at, chain, venue, users:author_user_id(handle)",
        )
        .in("status", ["live", "graduated"])
        .order("created_at", { ascending: false })
        .limit(48),
    ]);
    chapter = chapterRow;
    stories = storyRows;
  } catch (error) {
    console.error("Home feed failed", error);
  }

  const launches = (stories ?? []).map(mapStory);
  const liveCount = launches.filter((item) => item.status === "live").length;
  const bondedCount = launches.filter((item) => item.status === "graduated").length;

  return (
    <div className="space-y-10">
      <section className="glass relative overflow-hidden rounded-[28px] border border-arc/25 px-5 py-8 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-arc/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 size-64 rounded-full bg-secondary/25 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-arc">
              Arc home · every chain open
            </p>
            <h1 className="font-heading mt-3 text-4xl font-extrabold leading-[1.05] sm:text-6xl">
              Launch on Arc.
              <span className="block bg-gradient-to-r from-arc via-parchment to-gold bg-clip-text text-transparent">
                Pair any chain.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-parchment/75 sm:text-lg">{PAD_TAGLINE}</p>
            <p className="mt-2 max-w-xl text-sm text-parchment/55">{QUOTE_DISCLAIMER}</p>
            <p className="mt-2 max-w-xl text-sm text-parchment/45">{BONDING_COPY}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild className="rounded-full">
                <Link href="/launch/arc">Launch on Arc</Link>
              </Button>
              {profile ? (
                <Button variant="outline" asChild className="rounded-full">
                  <Link href="/wallet">Trade</Link>
                </Button>
              ) : (
                <Button variant="outline" asChild className="rounded-full">
                  <a href="/auth/login">Sign in with X</a>
                </Button>
              )}
              <Button variant="ghost" asChild className="rounded-full">
                <Link href="/launch">All chains</Link>
              </Button>
            </div>
          </div>
          <div className="glass rounded-2xl border border-arc/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">Pad stats</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-parchment/50">Live</dt>
                <dd className="font-heading text-2xl font-bold">{liveCount}</dd>
              </div>
              <div>
                <dt className="text-parchment/50">Bonded</dt>
                <dd className="font-heading text-2xl font-bold">{bondedCount}</dd>
              </div>
              <div>
                <dt className="text-parchment/50">Bond at</dt>
                <dd className="font-heading text-2xl font-bold">{SOLANA.bondingGraduationSol} SOL</dd>
              </div>
              <div>
                <dt className="text-parchment/50">Protocol</dt>
                <dd className="font-heading text-2xl font-bold">
                  {(PROTOCOL.protocolBpsDefault / 100).toFixed(2)}%
                </dd>
              </div>
            </dl>
            <div className="mt-5 space-y-2 text-xs text-parchment/55">
              <p>Arc is home. Solana prints. Ethereum, Base, and Robinhood Chain tag the Story. Pair SOL, cbBTC, stocks, memes, or any mint.</p>
              <p>
                <a className="text-arc hover:underline" href={SOLANA.explorer} target="_blank" rel="noreferrer">
                  Solana Explorer
                </a>
                {" · "}
                <a className="text-arc hover:underline" href={ARC_TESTNET.explorer} target="_blank" rel="noreferrer">
                  Arc explorer
                </a>
              </p>
              <JupiterStatusRow />
              {profile ? (
                <p className="text-parchment/70">Signed in as @{profile.handle}</p>
              ) : (
                <p>A OnceUponer is an X account. Connect a Solana wallet to sign.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="glass flex flex-col gap-4 rounded-2xl border border-arc/20 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge>Featured</Badge>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">First Chapter</p>
          </div>
          <h2 className="font-heading mt-2 text-2xl font-bold">{chapter?.title ?? "The First Chapter"}</h2>
          <p className="mt-1 max-w-xl text-sm text-parchment/65">
            The first official window. Launch on Arc, pair into real liquidity, bind any chain after.
          </p>
        </div>
        <Button variant="secondary" asChild className="rounded-full">
          <Link href="/chapter/the-first-chapter">Open the window</Link>
        </Button>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">Chains</p>
          <h2 className="font-heading mt-1 text-2xl font-bold">Launch anywhere. Pair anything.</h2>
        </div>
        <ChainChooser compact />
      </section>

      <FeedBoard launches={launches} />
      <LaunchTypeStrip />
    </div>
  );
}
