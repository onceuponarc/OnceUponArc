import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { fetchJupiterSwap } from "@/lib/jupiter";
import { parsePayer } from "@/lib/wallets/bound";
import { redactWalletError } from "@/lib/crypto/secret-box";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    quoteResponse?: Record<string, unknown>;
    userPublicKey?: string;
  };
  if (!body.quoteResponse) {
    return NextResponse.json({ error: "Get a Jupiter route first." }, { status: 400 });
  }

  try {
    const payer = parsePayer(body.userPublicKey);
    const result = await fetchJupiterSwap({
      userPublicKey: payer.toBase58(),
      quoteResponse: body.quoteResponse,
    });
    return NextResponse.json({ ...result, versioned: true });
  } catch (error) {
    return NextResponse.json({ error: redactWalletError(error) }, { status: 502 });
  }
}
