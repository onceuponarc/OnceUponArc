import { NextResponse } from "next/server";
import { fetchJupiterSwap } from "@/lib/jupiter";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userPublicKey?: string;
    quoteResponse?: Record<string, unknown>;
  };
  if (!body.userPublicKey || !body.quoteResponse) {
    return NextResponse.json({ error: "Wallet and Jupiter quote are required." }, { status: 400 });
  }

  try {
    const result = await fetchJupiterSwap({
      userPublicKey: body.userPublicKey,
      quoteResponse: body.quoteResponse,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Jupiter could not build the swap." },
      { status: 502 },
    );
  }
}
