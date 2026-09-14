import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCard, transferCard } from "@/lib/cards/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const { profile } = await getSessionUser();
    if (!profile) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const card = await getCard(slug);
    if (!card) return NextResponse.json({ error: "Card not found." }, { status: 404 });
    if (!card.listed) return NextResponse.json({ error: "This card is not listed." }, { status: 400 });
    if (card.ownerHandle.toLowerCase() === profile.handle.toLowerCase()) {
      return NextResponse.json({ error: "You already hold this card." }, { status: 400 });
    }
    const body = (await request.json()) as { tx?: string };
    const tx = (body.tx ?? "").trim();
    if (tx.length < 8) return NextResponse.json({ error: "Paste the USDC transfer hash or signature." }, { status: 400 });
    const next = await transferCard(slug, profile.handle, tx);
    return NextResponse.json({ card: next });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Claim failed." },
      { status: 400 },
    );
  }
}
