import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { PressCard } from "@/lib/cards/types";

const FILE =
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
    ? "/tmp/onceupon-press-cards.json"
    : process.env.ONCEUPON_CARDS_FILE || join(process.cwd(), "data", "press-cards.json");

let memory: PressCard[] | null = null;

function loadFile(): PressCard[] {
  if (memory) return memory;
  try {
    if (!existsSync(FILE)) {
      memory = [];
      return memory;
    }
    memory = JSON.parse(readFileSync(FILE, "utf8")) as PressCard[];
  } catch {
    memory = [];
  }
  return memory ?? [];
}

function saveFile(rows: PressCard[]) {
  memory = rows;
  try {
    mkdirSync(dirname(FILE), { recursive: true });
    writeFileSync(FILE, JSON.stringify(rows, null, 2));
  } catch {
    /* keep memory */
  }
}

function fromRow(row: Record<string, unknown>): PressCard {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    ticker: String(row.ticker),
    blurb: String(row.blurb ?? ""),
    tweetUrl: (row.tweet_url as string | null) ?? null,
    tweetId: (row.tweet_id as string | null) ?? null,
    tweetHandle: (row.tweet_handle as string | null) ?? null,
    coverUrl: (row.cover_url as string | null) ?? null,
    startPriceUi: Number(row.start_price_ui),
    startMcapUi: Number(row.start_mcap_ui),
    flywheel: (row.flywheel as PressCard["flywheel"]) || "creator",
    storySlug: (row.story_slug as string | null) ?? null,
    creatorHandle: String(row.creator_handle),
    creatorPayAddress: String(row.creator_pay_address),
    payNetwork: row.pay_network === "solana" ? "solana" : "arc",
    ownerHandle: String(row.owner_handle),
    listed: Boolean(row.listed),
    lastPayTx: (row.last_pay_tx as string | null) ?? null,
    createdAt: String(row.created_at),
  };
}

async function supabase() {
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    return createServiceClient();
  } catch {
    return null;
  }
}

export async function listCards(): Promise<PressCard[]> {
  const db = await supabase();
  if (db) {
    const { data, error } = await db.from("press_cards").select("*").order("created_at", { ascending: false });
    if (!error && data) return data.map((row) => fromRow(row as Record<string, unknown>));
  }
  return [...loadFile()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function getCard(slug: string): Promise<PressCard | null> {
  const db = await supabase();
  if (db) {
    const { data } = await db.from("press_cards").select("*").eq("slug", slug).maybeSingle();
    if (data) return fromRow(data as Record<string, unknown>);
  }
  return loadFile().find((row) => row.slug === slug) ?? null;
}

export async function cardsForHandle(handle: string): Promise<PressCard[]> {
  const needle = handle.replace(/^@/, "").toLowerCase();
  const rows = await listCards();
  return rows.filter(
    (row) => row.ownerHandle.toLowerCase() === needle || row.creatorHandle.toLowerCase() === needle,
  );
}

export async function writeCard(card: PressCard) {
  const db = await supabase();
  if (db) {
    const { error } = await db.from("press_cards").upsert(
      {
        id: card.id,
        slug: card.slug,
        title: card.title,
        ticker: card.ticker,
        blurb: card.blurb,
        tweet_url: card.tweetUrl,
        tweet_id: card.tweetId,
        tweet_handle: card.tweetHandle,
        cover_url: card.coverUrl,
        start_price_ui: card.startPriceUi,
        start_mcap_ui: card.startMcapUi,
        flywheel: card.flywheel,
        story_slug: card.storySlug,
        creator_handle: card.creatorHandle,
        creator_pay_address: card.creatorPayAddress,
        pay_network: card.payNetwork,
        owner_handle: card.ownerHandle,
        listed: card.listed,
        last_pay_tx: card.lastPayTx,
        created_at: card.createdAt,
      },
      { onConflict: "slug" },
    );
    if (!error) return;
  }
  const rows = loadFile().filter((row) => row.slug !== card.slug);
  rows.unshift(card);
  saveFile(rows);
}

export async function transferCard(slug: string, ownerHandle: string, lastPayTx: string) {
  const card = await getCard(slug);
  if (!card) return null;
  const next = { ...card, ownerHandle, lastPayTx, listed: false };
  await writeCard(next);
  return next;
}

export function slugifyCard(ticker: string) {
  const base = ticker
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 16);
  return `${base || "card"}-${Math.random().toString(36).slice(2, 6)}`;
}
