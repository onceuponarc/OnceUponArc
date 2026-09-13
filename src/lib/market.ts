import "server-only";

import { createClient } from "@/lib/supabase/server";
import { listLocalArcStories, localTape } from "@/lib/arc/store";
import { enrichLaunch, feedFromArc, type FeedLaunch, type RawTrade, type TapeItem } from "@/lib/feed";

type StoryRow = {
  id: string;
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
  curve_quote_lamports?: number | string | null;
  graduation_quote_raw?: number | string | null;
  quote_decimals?: number | null;
  mint_decimals?: number | null;
  supply?: number | string | null;
  users: { handle: string } | { handle: string }[] | null;
};

export async function loadPadMarket(): Promise<{ launches: FeedLaunch[]; tape: TapeItem[] }> {
  const local = listLocalArcStories().map(feedFromArc);
  const tape: TapeItem[] = localTape(24).map((item) => ({
    slug: item.slug,
    ticker: item.ticker,
    side: item.side,
    quoteUi: item.quoteUi,
    trader: item.trader,
    at: item.at,
    txHash: item.txHash,
  }));

  try {
    const supabase = await createClient();
    const { data: storyRows } = await supabase
      .from("stories")
      .select(
        "id, slug, title, ticker, blurb, engine, pair_label, author_bps, cover_url, status, created_at, chain, venue, curve_quote_lamports, graduation_quote_raw, quote_decimals, mint_decimals, supply, users:author_user_id(handle)",
      )
      .in("status", ["live", "graduated"])
      .order("created_at", { ascending: false })
      .limit(48);

    const stories = (storyRows ?? []) as unknown as StoryRow[];
    const ids = stories.map((row) => row.id);
    const tradesByStory = new Map<string, RawTrade[]>();
    if (ids.length) {
      const { data: tradeRows } = await supabase
        .from("trades")
        .select("story_id, side, trader, amount_in, amount_out, traded_at, price_usd")
        .in("story_id", ids)
        .order("traded_at", { ascending: true });
      for (const row of tradeRows ?? []) {
        const story = stories.find((item) => item.id === row.story_id);
        const list = tradesByStory.get(row.story_id) ?? [];
        list.push({
          storyId: row.story_id,
          slug: story?.slug,
          side: String(row.side),
          amountIn: Number(row.amount_in ?? 0),
          amountOut: Number(row.amount_out ?? 0),
          quoteDecimals: Number(story?.quote_decimals ?? 6),
          baseDecimals: Number(story?.mint_decimals ?? 6),
          trader: String(row.trader ?? ""),
          at: String(row.traded_at),
          priceUsd: row.price_usd != null ? Number(row.price_usd) : null,
        });
        tradesByStory.set(row.story_id, list);
        if (story) {
          const qDec = Number(story.quote_decimals ?? 6);
          const quoteUi =
            row.side === "buy" ? Number(row.amount_in ?? 0) / 10 ** qDec : Number(row.amount_out ?? 0) / 10 ** qDec;
          tape.push({
            slug: story.slug,
            ticker: story.ticker,
            side: row.side === "sell" ? "sell" : "buy",
            quoteUi,
            trader: String(row.trader ?? ""),
            at: String(row.traded_at),
          });
        }
      }
    }

    const remote: FeedLaunch[] = stories.map((row) => {
      const author = Array.isArray(row.users) ? row.users[0] : row.users;
      const qDec = Number(row.quote_decimals ?? 9);
      return enrichLaunch(
        {
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
        },
        tradesByStory.get(row.id) ?? [],
        {
          curveQuoteUi: Number(row.curve_quote_lamports ?? 0) / 10 ** qDec,
          graduateUi: Number(row.graduation_quote_raw ?? 0) / 10 ** qDec,
        },
      );
    });

    const seen = new Set(remote.map((item) => item.slug));
    const launches = [...local.filter((item) => !seen.has(item.slug)), ...remote].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );
    tape.sort((a, b) => +new Date(b.at) - +new Date(a.at));
    return { launches, tape: tape.slice(0, 24) };
  } catch (error) {
    console.error("Pad market failed", error);
    return { launches: local, tape: tape.slice(0, 24) };
  }
}
