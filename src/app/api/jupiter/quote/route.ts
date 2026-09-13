import { NextResponse } from "next/server";
import { fetchJupiterQuote } from "@/lib/jupiter";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const inputMint = url.searchParams.get("inputMint") ?? "";
  const outputMint = url.searchParams.get("outputMint") ?? "";
  const amount = url.searchParams.get("amount") ?? "";
  const slippageBps = Number(url.searchParams.get("slippageBps") ?? 50);

  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json({ error: "inputMint, outputMint, and amount are required." }, { status: 400 });
  }
  if (inputMint === outputMint) {
    return NextResponse.json({ error: "Pick two different mints." }, { status: 400 });
  }

  try {
    const { quote, raw } = await fetchJupiterQuote({ inputMint, outputMint, amount, slippageBps });
    return NextResponse.json({ quote, raw });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Jupiter quote failed." },
      { status: 502 },
    );
  }
}
