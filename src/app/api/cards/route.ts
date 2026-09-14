import { NextResponse } from "next/server";
import { viewAllCards } from "@/lib/cards/resolve";

export const dynamic = "force-dynamic";

export async function GET() {
  const cards = await viewAllCards();
  return NextResponse.json({ cards });
}
