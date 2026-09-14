import { NextResponse } from "next/server";
import { viewAllCards } from "@/lib/cards/resolve";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cards = await viewAllCards();
    return NextResponse.json({ cards });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cards failed.", cards: [] },
      { status: 200 },
    );
  }
}
