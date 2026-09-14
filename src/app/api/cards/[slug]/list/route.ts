import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCard, writeCard } from "@/lib/cards/store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const { profile } = await getSessionUser();
    if (!profile) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const card = await getCard(slug);
    if (!card) return NextResponse.json({ error: "Card not found." }, { status: 404 });
    if (card.ownerHandle.toLowerCase() !== profile.handle.toLowerCase()) {
      return NextResponse.json({ error: "Only the holder can list this jacket." }, { status: 403 });
    }
    const body = (await request.json()) as { listed?: boolean };
    await writeCard({ ...card, listed: Boolean(body.listed) });
    return NextResponse.json({ ok: true, listed: Boolean(body.listed) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "List failed." },
      { status: 400 },
    );
  }
}
