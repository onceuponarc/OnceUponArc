import { listCards, getCard } from "@/lib/cards/store";
import { viewCard } from "@/lib/cards/math";
import type { CardView, PressCard } from "@/lib/cards/types";
import { loadPadMarket } from "@/lib/market";

async function mcapMap() {
  try {
    const { launches } = await loadPadMarket();
    return new Map(launches.map((row) => [row.slug, row.mcapUi]));
  } catch {
    return new Map<string, number>();
  }
}

export async function viewAllCards(): Promise<CardView[]> {
  const mcaps = await mcapMap();
  return listCards().map((card) => viewCard(card, card.storySlug ? mcaps.get(card.storySlug) : null));
}

export async function viewOneCard(slug: string): Promise<CardView | null> {
  const card = getCard(slug);
  if (!card) return null;
  const mcaps = await mcapMap();
  return viewCard(card, card.storySlug ? mcaps.get(card.storySlug) : null);
}

export function previewCard(card: PressCard, mcap?: number) {
  return viewCard(card, mcap);
}
