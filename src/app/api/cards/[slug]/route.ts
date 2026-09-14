import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCard, writeCard } from "@/lib/cards/store";
import { CARD_FLYWHEELS, type CardFlywheel } from "@/lib/cards/types";

export const dynamic = "force-dynamic";

const FLY = new Set(CARD_FLYWHEELS.map((row) => row.id));

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const card = await getCard(slug);
  if (!card) return NextResponse.json({ error: "Card not found." }, { status: 404 });
  return NextResponse.json({ card });
}

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const { profile } = await getSessionUser();
    if (!profile) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const card = await getCard(slug);
    if (!card) return NextResponse.json({ error: "Card not found." }, { status: 404 });
    const mine =
      card.ownerHandle.toLowerCase() === profile.handle.toLowerCase() ||
      card.creatorHandle.toLowerCase() === profile.handle.toLowerCase();
    if (!mine) return NextResponse.json({ error: "Only the holder or creator can edit." }, { status: 403 });

    const body = (await request.json()) as Partial<{
      coverUrl: string | null;
      blurb: string;
      listed: boolean;
      storySlug: string | null;
      creatorPayAddress: string;
      payNetwork: "arc" | "solana";
      flywheel: string;
      title: string;
    }>;

    const next = {
      ...card,
      coverUrl: body.coverUrl === undefined ? card.coverUrl : body.coverUrl,
      blurb: body.blurb === undefined ? card.blurb : body.blurb.slice(0, 280),
      listed: body.listed === undefined ? card.listed : Boolean(body.listed),
      storySlug: body.storySlug === undefined ? card.storySlug : body.storySlug || null,
      creatorPayAddress: body.creatorPayAddress?.trim() || card.creatorPayAddress,
      payNetwork: body.payNetwork === "solana" || body.payNetwork === "arc" ? body.payNetwork : card.payNetwork,
      flywheel: FLY.has((body.flywheel ?? card.flywheel) as CardFlywheel)
        ? ((body.flywheel ?? card.flywheel) as CardFlywheel)
        : card.flywheel,
      title: body.title === undefined ? card.title : body.title.slice(0, 48),
    };
    await writeCard(next);
    return NextResponse.json({ card: next });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed." },
      { status: 400 },
    );
  }
}
