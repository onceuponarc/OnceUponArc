import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// This endpoint used to flip card ownership based on a user-pasted "tx hash"
// string with zero on-chain verification — anyone could type any 8+ character
// string and take any listed card for free. Replaced by the offers flow
// (/api/press/offers), which settles atomically from real desk-wallet
// transactions instead of trusting client-submitted proof.
export async function POST() {
  return NextResponse.json(
    { error: "Buying a card now goes through an offer — use the offer panel on the card page." },
    { status: 410 },
  );
}
