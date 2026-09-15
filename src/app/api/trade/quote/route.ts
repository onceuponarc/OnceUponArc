import { NextResponse } from "next/server";
import { getJupiterQuote, WSOL_MINT } from "@/lib/solana/jupiter";
import { getMintInfo } from "@/lib/solana/mint-info";
import { SOLANA } from "@onceupon/config/solana";

export const dynamic = "force-dynamic";

function resolveQuoteMint(asset: string | null) {
  if (asset === "usdc") return SOLANA.usdcMint;
  return WSOL_MINT;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const tokenMint = url.searchParams.get("token");
    const quoteAsset = url.searchParams.get("quote");
    const side = url.searchParams.get("side") === "sell" ? "sell" : "buy";
    const uiAmount = Number(url.searchParams.get("amount") ?? "0");
    if (!tokenMint) return NextResponse.json({ error: "Missing token mint." }, { status: 400 });
    if (!Number.isFinite(uiAmount) || uiAmount <= 0) {
      return NextResponse.json({ error: "Enter an amount above zero." }, { status: 400 });
    }

    const quoteMint = resolveQuoteMint(quoteAsset);
    const inputMint = side === "buy" ? quoteMint : tokenMint;
    const outputMint = side === "buy" ? tokenMint : quoteMint;

    const [inputInfo, outputInfo] = await Promise.all([getMintInfo(inputMint), getMintInfo(outputMint)]);
    const amountRaw = BigInt(Math.round(uiAmount * 10 ** inputInfo.decimals)).toString();

    const quote = await getJupiterQuote({ inputMint, outputMint, amountRaw, slippageBps: 100 });

    return NextResponse.json({
      inputMint,
      outputMint,
      inAmountUi: Number(quote.inAmount) / 10 ** inputInfo.decimals,
      outAmountUi: Number(quote.outAmount) / 10 ** outputInfo.decimals,
      minReceivedUi: Number(quote.otherAmountThreshold) / 10 ** outputInfo.decimals,
      priceImpactPct: Number(quote.priceImpactPct),
      route: quote.routePlan?.map((r) => r.swapInfo.label).join(" + ") || "Jupiter",
      raw: quote,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not get a quote." },
      { status: 400 },
    );
  }
}
