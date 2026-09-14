import "server-only";

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { PressCard } from "@/lib/cards/types";

const FILE = process.env.ONCEUPON_CARDS_FILE || join(process.cwd(), "data", "press-cards.json");

let memory: PressCard[] | null = null;

function load(): PressCard[] {
  if (memory) return memory;
  if (!existsSync(FILE)) {
    memory = [];
    return memory;
  }
  try {
    memory = JSON.parse(readFileSync(FILE, "utf8")) as PressCard[];
  } catch {
    memory = [];
  }
  return memory;
}

function save(rows: PressCard[]) {
  memory = rows;
  mkdirSync(dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(rows, null, 2));
}

export function listCards(): PressCard[] {
  return [...load()].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getCard(slug: string): PressCard | null {
  return load().find((row) => row.slug === slug) ?? null;
}

export function cardsForHandle(handle: string): PressCard[] {
  const needle = handle.replace(/^@/, "").toLowerCase();
  return listCards().filter(
    (row) => row.ownerHandle.toLowerCase() === needle || row.creatorHandle.toLowerCase() === needle,
  );
}

export function writeCard(card: PressCard) {
  const rows = load().filter((row) => row.slug !== card.slug);
  rows.unshift(card);
  save(rows);
}

export function transferCard(slug: string, ownerHandle: string, lastPayTx: string) {
  const card = getCard(slug);
  if (!card) return null;
  const next = { ...card, ownerHandle, lastPayTx, listed: false };
  writeCard(next);
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
