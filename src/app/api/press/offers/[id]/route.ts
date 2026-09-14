import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCard, getOffer, setOfferStatus, logActivity } from "@/lib/cards/store";
import { settleOffer } from "@/lib/press/settle";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const offer = await getOffer(id);
  if (!offer) return NextResponse.json({ error: "Offer not found." }, { status: 404 });
  return NextResponse.json({ offer });
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { profile } = await getSessionUser();
    if (!profile) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const body = (await request.json()) as { action?: "accept" | "decline" | "cancel" };
    const offer = await getOffer(id);
    if (!offer) return NextResponse.json({ error: "Offer not found." }, { status: 404 });
    if (new Date(offer.expiresAt).getTime() < Date.now() && offer.status === "open") {
      await setOfferStatus(id, "open", { status: "expired" });
      return NextResponse.json({ error: "This offer expired." }, { status: 400 });
    }

    if (body.action === "cancel") {
      if (offer.buyerHandle.toLowerCase() !== profile.handle.toLowerCase()) {
        return NextResponse.json({ error: "Only the buyer can cancel their offer." }, { status: 403 });
      }
      const next = await setOfferStatus(id, "open", { status: "cancelled" });
      await logActivity({ cardSlug: offer.cardSlug, kind: "offer_cancelled", detail: { buyer: offer.buyerHandle } });
      return NextResponse.json({ offer: next });
    }

    // Accept/decline: re-check current ownership fresh — never trust the offer
    // row's cached sellerHandle for authorization, only who owns the card now.
    const card = await getCard(offer.cardSlug);
    if (!card) return NextResponse.json({ error: "Card not found." }, { status: 404 });
    if (card.ownerHandle.toLowerCase() !== profile.handle.toLowerCase()) {
      return NextResponse.json({ error: "Only the current owner can respond to this offer." }, { status: 403 });
    }

    if (body.action === "decline") {
      const next = await setOfferStatus(id, "open", { status: "declined" });
      await logActivity({ cardSlug: offer.cardSlug, kind: "offer_declined", detail: { seller: profile.handle } });
      return NextResponse.json({ offer: next });
    }

    if (body.action === "accept") {
      const accepted = await setOfferStatus(id, "open", { status: "accepted" });
      await logActivity({
        cardSlug: offer.cardSlug,
        kind: "offer_accepted",
        detail: { buyer: offer.buyerHandle, seller: profile.handle, amount: offer.offerAmountUi },
      });
      const result = await settleOffer(accepted);
      return NextResponse.json({ offer: { ...accepted, status: result.status }, settlement: result });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not update the offer." },
      { status: 400 },
    );
  }
}
