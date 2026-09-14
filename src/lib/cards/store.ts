import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { PressCard, PressOffer, PressActivity, OfferStatus } from "@/lib/cards/types";

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
    nftMint: (row.nft_mint as string | null) ?? null,
    pressNumber: row.press_number != null ? Number(row.press_number) : null,
    rarity: (row.rarity as string) || "common",
    editionIndex: Number(row.edition_index ?? 1),
    editionTotal: Number(row.edition_total ?? 1),
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

export async function cardsForStory(storySlug: string): Promise<PressCard[]> {
  const needle = storySlug.toLowerCase();
  const rows = await listCards();
  return rows.filter((row) => (row.storySlug ?? "").toLowerCase() === needle);
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
        nft_mint: card.nftMint,
        rarity: card.rarity,
        edition_index: card.editionIndex,
        edition_total: card.editionTotal,
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

/** Resolves an @handle to the Supabase user id backing its desk wallets.
 *  Every settlement step re-resolves fresh from here rather than trusting a
 *  cached wallet address, so a stale/rotated desk key can never be used to
 *  authorize someone else's card or payment. */
export async function resolveHandleUserId(handle: string): Promise<string | null> {
  const db = await supabase();
  if (!db) return null;
  const needle = handle.replace(/^@/, "");
  const { data } = await db.from("users").select("id").ilike("handle", needle).maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

function offerFromRow(row: Record<string, unknown>): PressOffer {
  return {
    id: String(row.id),
    cardSlug: String(row.card_slug),
    buyerHandle: String(row.buyer_handle),
    sellerHandle: String(row.seller_handle),
    offerAmountUi: Number(row.offer_amount_ui),
    paymentMint: (row.payment_mint as string | null) ?? null,
    status: row.status as OfferStatus,
    txSignature: (row.tx_signature as string | null) ?? null,
    failReason: (row.fail_reason as string | null) ?? null,
    expiresAt: String(row.expires_at),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function createOffer(input: {
  cardSlug: string;
  buyerHandle: string;
  sellerHandle: string;
  offerAmountUi: number;
  paymentMint?: string | null;
}): Promise<PressOffer> {
  const db = await supabase();
  if (!db) throw new Error("Offers need the database configured.");
  const { data, error } = await db
    .from("press_offers")
    .insert({
      card_slug: input.cardSlug,
      buyer_handle: input.buyerHandle,
      seller_handle: input.sellerHandle,
      offer_amount_ui: input.offerAmountUi,
      payment_mint: input.paymentMint ?? null,
      status: "open",
    })
    .select("*")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not create the offer.");
  return offerFromRow(data as Record<string, unknown>);
}

export async function getOffer(id: string): Promise<PressOffer | null> {
  const db = await supabase();
  if (!db) return null;
  const { data } = await db.from("press_offers").select("*").eq("id", id).maybeSingle();
  return data ? offerFromRow(data as Record<string, unknown>) : null;
}

export async function listOffersForCard(slug: string): Promise<PressOffer[]> {
  const db = await supabase();
  if (!db) return [];
  const { data } = await db
    .from("press_offers")
    .select("*")
    .eq("card_slug", slug)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => offerFromRow(row as Record<string, unknown>));
}

/** Every transition is validated server-side by the caller; this just persists
 *  it and stamps updated_at. `expectedStatus` is an optimistic-concurrency
 *  guard — if someone else already moved the offer, this fails loudly instead
 *  of double-settling it. */
export async function setOfferStatus(
  id: string,
  expectedStatus: OfferStatus | OfferStatus[],
  next: { status: OfferStatus; txSignature?: string | null; failReason?: string | null },
): Promise<PressOffer> {
  const db = await supabase();
  if (!db) throw new Error("Offers need the database configured.");
  const expected = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  const { data, error } = await db
    .from("press_offers")
    .update({
      status: next.status,
      tx_signature: next.txSignature ?? undefined,
      fail_reason: next.failReason ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .in("status", expected)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("This offer already moved — refresh and try again.");
  return offerFromRow(data as Record<string, unknown>);
}

export async function logActivity(input: {
  cardSlug: string;
  kind: string;
  detail?: Record<string, unknown>;
  txSignature?: string | null;
}): Promise<void> {
  const db = await supabase();
  if (!db) return;
  await db.from("press_activity").insert({
    card_slug: input.cardSlug,
    kind: input.kind,
    detail: input.detail ?? {},
    tx_signature: input.txSignature ?? null,
  });
}

export async function listActivity(slug: string, limit = 50): Promise<PressActivity[]> {
  const db = await supabase();
  if (!db) return [];
  const { data } = await db
    .from("press_activity")
    .select("*")
    .eq("card_slug", slug)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => ({
    id: String(row.id),
    cardSlug: String(row.card_slug),
    kind: String(row.kind),
    detail: (row.detail as Record<string, unknown>) ?? {},
    txSignature: (row.tx_signature as string | null) ?? null,
    createdAt: String(row.created_at),
  }));
}
