import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Swaps are signed in your connected Solana wallet. Use /api/jupiter/swap, then send the signed transaction." },
    { status: 410 },
  );
}
