import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export type LocalArcTrade = {
  txHash: string;
  side: "buy" | "sell";
  trader: string;
  amountIn: string;
  amountOut: string;
  priceUsd: number;
  tradedAt: string;
};

export type LocalArcStory = {
  id: string;
  slug: string;
  title: string;
  ticker: string;
  blurb: string;
  engine: "author" | "onceuponers";
  status: "live" | "graduated";
  chain: "arc";
  venue: "spl";
  pairLabel: "USDC";
  authorBps: number;
  protocolBps: number;
  handle: string | null;
  coverUrl: string | null;
  createdAt: string;
  tokenAddress: `0x${string}`;
  curveAddress: `0x${string}`;
  quoteAddress: `0x${string}`;
  storyId: `0x${string}`;
  createdTx: `0x${string}`;
  mintDecimals: 18;
  quoteDecimals: 6;
  supply: string;
  graduationQuoteRaw: string;
  curveQuoteRaw: string;
  curveTokenRaw: string;
  virtualQuoteRaw: string;
  virtualBaseRaw: string;
  trades: LocalArcTrade[];
};

const FILE = process.env.ARC_STORIES_FILE || join(process.cwd(), "data", "arc-stories.json");

let memory: LocalArcStory[] | null = null;

function empty(): LocalArcStory[] {
  return [];
}

function readAll(): LocalArcStory[] {
  if (memory) return memory;
  if (!existsSync(FILE)) return empty();
  try {
    const parsed = JSON.parse(readFileSync(FILE, "utf8")) as LocalArcStory[];
    memory = Array.isArray(parsed) ? parsed : empty();
    return memory;
  } catch {
    return empty();
  }
}

function writeAll(stories: LocalArcStory[]) {
  memory = stories;
  try {
    mkdirSync(dirname(FILE), { recursive: true });
    writeFileSync(FILE, JSON.stringify(stories, null, 2));
  } catch (error) {
    console.error("Arc local store write skipped", error instanceof Error ? error.message : error);
  }
}

export function listLocalArcStories(): LocalArcStory[] {
  return readAll().sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getLocalArcStory(slug: string): LocalArcStory | null {
  return readAll().find((item) => item.slug === slug) ?? null;
}

export function upsertLocalArcStory(story: LocalArcStory) {
  const all = readAll();
  const idx = all.findIndex((item) => item.slug === story.slug);
  if (idx >= 0) all[idx] = story;
  else all.unshift(story);
  writeAll(all);
}

export function appendLocalArcTrade(slug: string, trade: LocalArcTrade, patch?: Partial<LocalArcStory>) {
  const all = readAll();
  const idx = all.findIndex((item) => item.slug === slug);
  if (idx < 0) return;
  const next = { ...all[idx], ...patch, trades: [trade, ...all[idx].trades].slice(0, 200) };
  all[idx] = next;
  writeAll(all);
  return next;
}

export function localTape(limit = 24) {
  return listLocalArcStories()
    .flatMap((story) =>
      story.trades.map((trade) => ({
        slug: story.slug,
        ticker: story.ticker,
        side: trade.side,
        amountUsd: trade.priceUsd * (trade.side === "buy" ? 1 : 1),
        quoteUi: Number(trade.side === "buy" ? trade.amountIn : trade.amountOut) / 1e6,
        trader: trade.trader,
        at: trade.tradedAt,
        txHash: trade.txHash,
      })),
    )
    .sort((a, b) => +new Date(b.at) - +new Date(a.at))
    .slice(0, limit);
}
