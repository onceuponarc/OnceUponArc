import { NextResponse } from "next/server";
import { getCard } from "@/lib/cards/store";
import { pressId } from "@/lib/cards/types";
import { CARD_FLYWHEELS } from "@/lib/cards/types";
import { PUBLIC_SITE_URL } from "@onceupon/config/urls";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const card = await getCard(slug);
  if (!card) return NextResponse.json({ error: "Card not found." }, { status: 404 });
  const flywheel = CARD_FLYWHEELS.find((row) => row.id === card.flywheel);
  return NextResponse.json({
    name: `${card.title} — ${pressId(card.pressNumber)}`,
    symbol: card.ticker,
    description: card.blurb,
    image: card.coverUrl ?? undefined,
    external_url: `${PUBLIC_SITE_URL}/cards/${card.slug}`,
    attributes: [
      { trait_type: "Press ID", value: pressId(card.pressNumber) },
      { trait_type: "Card mode", value: flywheel?.label ?? card.flywheel },
      { trait_type: "Rarity", value: card.rarity },
      { trait_type: "Edition", value: `${card.editionIndex}/${card.editionTotal}` },
      { trait_type: "Creator", value: `@${card.creatorHandle}` },
      { trait_type: "Starting MC", value: card.startMcapUi },
      { trait_type: "Starting price", value: card.startPriceUi },
    ],
    properties: {
      category: "image",
      files: card.coverUrl ? [{ uri: card.coverUrl, type: "image/png" }] : [],
    },
  });
}
