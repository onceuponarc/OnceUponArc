import "server-only";

import { createServiceClient } from "@/lib/supabase/service";
import type { LocalArcStory, LocalArcTrade } from "@/lib/arc/store";
import { getLocalArcStory, listLocalArcStories, upsertLocalArcStory } from "@/lib/arc/store";

const EXTRA = ["curve_address", "virtual_base_raw", "lp_base_reserved_raw", "curve_k"];

function serviceOrNull() {
  try {
    return createServiceClient();
  } catch {
    return null;
  }
}

function storyRow(story: LocalArcStory, userId: string | null, authorWallet: string) {
  return {
    slug: story.slug,
    title: story.title,
    ticker: story.ticker,
    blurb: story.blurb,
    cover_url: story.coverUrl,
    author_user_id: userId,
    author_wallet: authorWallet,
    engine: story.engine,
    status: story.status,
    token_address: story.tokenAddress,
    vault_address: story.curveAddress,
    curve_address: story.curveAddress,
    fee_recipient: authorWallet,
    author_bps: story.authorBps,
    protocol_bps: story.protocolBps,
    quote_address: story.quoteAddress,
    pair_class: "usdc",
    pair_label: story.pairLabel,
    supply: story.supply,
    decimals: 18,
    rights_attested: true,
    created_tx: story.createdTx,
    chain: "arc",
    venue: "spl",
    quote_mint: story.quoteAddress,
    curve_quote_lamports: story.curveQuoteRaw,
    curve_token_raw: story.curveTokenRaw,
    mint_decimals: 18,
    quote_decimals: 6,
    virtual_quote_raw: story.virtualQuoteRaw,
    graduation_quote_raw: story.graduationQuoteRaw,
    virtual_base_raw: story.virtualBaseRaw,
    lp_base_reserved_raw: null,
    curve_k: null,
    onchain_story_id: story.storyId,
  } as Record<string, unknown>;
}

export async function persistArcStory(
  story: LocalArcStory,
  opts: { userId?: string | null; authorWallet: string },
) {
  const service = serviceOrNull();
  if (!service) return;
  const slim = storyRow(story, opts.userId ?? null, opts.authorWallet);
  for (let i = 0; i < EXTRA.length + 3; i += 1) {
    const result = await service.from("stories").upsert(slim, { onConflict: "slug" }).select("id, slug").single();
    if (!result.error) return result.data;
    const message = result.error.message ?? "";
    const hit = EXTRA.filter((col) => message.includes(col));
    if (hit.length) {
      for (const col of hit) delete slim[col];
      continue;
    }
    if (slim.author_user_id && /author_user_id/i.test(message)) {
      slim.author_user_id = null;
      continue;
    }
    console.error("Arc story persist failed", message);
    return;
  }
}

export async function persistArcTrade(slug: string, trade: LocalArcTrade, patch: Partial<LocalArcStory>) {
  const service = serviceOrNull();
  if (!service) return;
  const { data: story } = await service.from("stories").select("id").eq("slug", slug).maybeSingle();
  if (!story?.id) return;
  const storyPatch: Record<string, unknown> = {
    status: patch.status,
    curve_quote_lamports: patch.curveQuoteRaw,
    curve_token_raw: patch.curveTokenRaw,
    virtual_quote_raw: patch.virtualQuoteRaw,
    virtual_base_raw: patch.virtualBaseRaw,
  };
  const updated = await service.from("stories").update(storyPatch).eq("id", story.id);
  if (updated.error && (updated.error.message ?? "").includes("virtual_base_raw")) {
    delete storyPatch.virtual_base_raw;
    await service.from("stories").update(storyPatch).eq("id", story.id);
  }
  const inserted = await service.from("trades").insert({
    story_id: story.id,
    tx_hash: trade.txHash,
    log_index: 0,
    trader: trade.trader,
    side: trade.side,
    token_in: trade.side === "buy" ? "USDC" : slug,
    token_out: trade.side === "buy" ? slug : "USDC",
    amount_in: trade.amountIn,
    amount_out: trade.amountOut,
    price_usd: trade.priceUsd,
  });
  if (inserted.error && !(inserted.error.message ?? "").toLowerCase().includes("duplicate")) {
    console.error("Arc trade persist failed", inserted.error.message);
  }
}

function asStory(row: Record<string, unknown>, trades: LocalArcTrade[] = []): LocalArcStory {
  return {
    id: String(row.onchain_story_id ?? row.id),
    slug: String(row.slug),
    title: String(row.title),
    ticker: String(row.ticker),
    blurb: String(row.blurb ?? ""),
    engine: row.engine === "onceuponers" ? "onceuponers" : "author",
    status: row.status === "graduated" ? "graduated" : "live",
    chain: "arc",
    venue: "spl",
    pairLabel: "USDC",
    authorBps: Number(row.author_bps ?? 100),
    protocolBps: Number(row.protocol_bps ?? 20),
    handle: null,
    coverUrl: (row.cover_url as string | null) ?? null,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    tokenAddress: row.token_address as `0x${string}`,
    curveAddress: (row.curve_address || row.vault_address) as `0x${string}`,
    quoteAddress: (row.quote_address || row.quote_mint) as `0x${string}`,
    storyId: (row.onchain_story_id as `0x${string}`) ?? (row.id as `0x${string}`),
    createdTx: (row.created_tx as `0x${string}`) ?? "0x",
    mintDecimals: 18,
    quoteDecimals: 6,
    supply: String(row.supply ?? "0"),
    graduationQuoteRaw: String(row.graduation_quote_raw ?? "0"),
    curveQuoteRaw: String(row.curve_quote_lamports ?? "0"),
    curveTokenRaw: String(row.curve_token_raw ?? "0"),
    virtualQuoteRaw: String(row.virtual_quote_raw ?? "0"),
    virtualBaseRaw: String(row.virtual_base_raw ?? "0"),
    trades,
  };
}

function mapTrades(
  rows: { tx_hash: string; side: string; trader: string | null; amount_in: string | number | null; amount_out: string | number | null; price_usd: number | null; traded_at: string }[],
): LocalArcTrade[] {
  return rows.map((trade) => ({
    txHash: String(trade.tx_hash),
    side: trade.side === "sell" ? "sell" : "buy",
    trader: String(trade.trader ?? ""),
    amountIn: String(trade.amount_in ?? "0"),
    amountOut: String(trade.amount_out ?? "0"),
    priceUsd: Number(trade.price_usd ?? 0),
    tradedAt: String(trade.traded_at),
  }));
}

export async function loadArcStory(slug: string): Promise<LocalArcStory | null> {
  const local = getLocalArcStory(slug);
  if (local) return local;
  const service = serviceOrNull();
  if (!service) return null;
  const { data } = await service.from("stories").select("*").eq("slug", slug).eq("chain", "arc").maybeSingle();
  if (!data) return null;
  const { data: trades } = await service
    .from("trades")
    .select("tx_hash, side, trader, amount_in, amount_out, price_usd, traded_at")
    .eq("story_id", data.id)
    .order("traded_at", { ascending: false });
  const story = asStory(data as Record<string, unknown>, mapTrades(trades ?? []));
  upsertLocalArcStory(story);
  return story;
}

export async function listPersistedArcStories(): Promise<LocalArcStory[]> {
  const service = serviceOrNull();
  if (!service) return listLocalArcStories();
  const { data, error } = await service
    .from("stories")
    .select("*")
    .eq("chain", "arc")
    .in("status", ["live", "graduated"])
    .order("created_at", { ascending: false });
  if (error || !data?.length) return listLocalArcStories();
  const ids = data.map((row) => row.id);
  const { data: trades } = await service
    .from("trades")
    .select("story_id, tx_hash, side, trader, amount_in, amount_out, price_usd, traded_at")
    .in("story_id", ids)
    .order("traded_at", { ascending: false });
  const byStory = new Map<string, LocalArcTrade[]>();
  for (const trade of trades ?? []) {
    const list = byStory.get(trade.story_id) ?? [];
    list.push(...mapTrades([trade]));
    byStory.set(trade.story_id, list);
  }
  const remote = data.map((row) => asStory(row as Record<string, unknown>, byStory.get(row.id) ?? []));
  const seen = new Set(remote.map((story) => story.slug));
  return [...remote, ...listLocalArcStories().filter((story) => !seen.has(story.slug))];
}
