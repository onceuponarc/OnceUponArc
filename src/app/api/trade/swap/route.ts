import { NextResponse } from "next/server";
import { VersionedTransaction } from "@solana/web3.js";
import { getSessionUser } from "@/lib/auth";
import { getJupiterQuote, getJupiterSwapTx, WSOL_MINT } from "@/lib/solana/jupiter";
import { getMintInfo } from "@/lib/solana/mint-info";
import { deskSolanaKey } from "@/lib/wallets/sign-desk";
import { sendSignedTx, waitForTx, explorerFromSig } from "@/lib/solana/partial-tx";
import { solanaConnection } from "@/lib/solana/connection";
import { SOLANA } from "@onceupon/config/solana";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

function resolveQuoteMint(asset: string | null | undefined) {
  return asset === "usdc" ? SOLANA.usdcMint : WSOL_MINT;
}

export async function POST(request: Request) {
  try {
    const { user } = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });

    const body = (await request.json()) as {
      tokenMint?: string;
      quoteAsset?: "sol" | "usdc";
      side?: "buy" | "sell";
      amount?: number;
    };
    const tokenMint = (body.tokenMint ?? "").trim();
    const side = body.side === "sell" ? "sell" : "buy";
    const uiAmount = Number(body.amount);
    if (!tokenMint) return NextResponse.json({ error: "Missing token." }, { status: 400 });
    if (!Number.isFinite(uiAmount) || uiAmount <= 0) {
      return NextResponse.json({ error: "Enter an amount above zero." }, { status: 400 });
    }

    // Re-derive the quote fresh server-side rather than accepting one the client
    // sent back — a tampered quote could misstate price impact or min-received.
    const quoteMint = resolveQuoteMint(body.quoteAsset);
    const inputMint = side === "buy" ? quoteMint : tokenMint;
    const outputMint = side === "buy" ? tokenMint : quoteMint;
    const inputInfo = await getMintInfo(inputMint);
    const amountRaw = BigInt(Math.round(uiAmount * 10 ** inputInfo.decimals)).toString();

    const payer = await deskSolanaKey(user.id);

    if (inputMint === WSOL_MINT) {
      const balance = await solanaConnection().getBalance(payer.publicKey);
      if (BigInt(balance) < BigInt(amountRaw) + 5_000_000n) {
        return NextResponse.json({ error: "Not enough SOL in your desk wallet for this trade + fees." }, { status: 400 });
      }
    }

    const quote = await getJupiterQuote({ inputMint, outputMint, amountRaw, slippageBps: 100 });
    const swapTxBase64 = await getJupiterSwapTx(quote, payer.publicKey.toBase58());

    const tx = VersionedTransaction.deserialize(Buffer.from(swapTxBase64, "base64"));
    tx.sign([payer]);
    const signature = await sendSignedTx(Buffer.from(tx.serialize()).toString("base64"));
    await waitForTx(signature);

    const outputInfo = await getMintInfo(outputMint);
    return NextResponse.json({
      signature,
      explorer: explorerFromSig(signature),
      outAmountUi: Number(quote.outAmount) / 10 ** outputInfo.decimals,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Trade failed." },
      { status: 400 },
    );
  }
}
