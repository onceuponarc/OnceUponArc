import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCard, createOffer, logActivity, listOffersForCard } from "@/lib/cards/store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("card");
  if (!slug) return NextResponse.json({ error: "Missing card slug." }, { status: 400 });
  const offers = await listOffersForCard(slug);
  return NextResponse.json({ offers });
}

export async function POST(request: Request) {
  try {
    const { profile } = await getSessionUser();
    if (!profile) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const body = (await request.json()) as { cardSlug?: string; offerAmountUi?: number };
    const cardSlug = (body.cardSlug ?? "").trim();
    const offerAmountUi = Number(body.offerAmountUi);
    if (!cardSlug) return NextResponse.json({ error: "Missing card." }, { status: 400 });
    if (!Number.isFinite(offerAmountUi) || offerAmountUi <= 0) {
      return NextResponse.json({ error: "Offer must be above zero." }, { status: 400 });
    }
    const card = await getCard(cardSlug);
    if (!card) return NextResponse.json({ error: "Card not found." }, { status: 404 });
    if (card.ownerHandle.toLowerCase() === profile.handle.toLowerCase()) {
      return NextResponse.json({ error: "You already hold this card." }, { status: 400 });
    }
    const offer = await createOffer({
      cardSlug,
      buyerHandle: profile.handle,
      sellerHandle: card.ownerHandle,
      offerAmountUi,
    });
    await logActivity({
      cardSlug,
      kind: "offer_created",
      detail: { buyer: profile.handle, seller: card.ownerHandle, amount: offerAmountUi },
    });
    return NextResponse.json({ offer });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send the offer." },
      { status: 400 },
    );
  }
}
