import { NextResponse } from "next/server";
import BN from "bn.js";
import { PublicKey, Transaction, ComputeBudgetProgram } from "@solana/web3.js";
import { NATIVE_MINT } from "@solana/spl-token";
import { OnlinePumpAmmSdk, PUMP_AMM_SDK } from "@pump-fun/pump-swap-sdk";
import { getSessionUser } from "@/lib/auth";
import { solanaConnection } from "@/lib/solana/connection";
import { inspectMint, tokenBalance, ataFor } from "@/lib/solana/mint";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { profile } = await getSessionUser();
    if (!profile) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const body = (await request.json()) as { publicKey?: string; mint?: string; seedSol?: number };
    const payer = new PublicKey(body.publicKey ?? "");
    const mint = new PublicKey(body.mint ?? "");
    const seedSol = Math.max(0.02, Number(body.seedSol ?? 0.05));
    const connection = solanaConnection();
    const meta = await inspectMint(mint);
    const userAta = ataFor(meta.mint, payer, meta.programId);
    const baseBal = await tokenBalance(userAta, meta.programId);
    if (baseBal === 0n) throw new Error("Mint the token first. Your ATA is empty.");
    const baseIn = (baseBal * 80n) / 100n;
    const quoteIn = BigInt(Math.round(seedSol * LAMPORTS_PER_SOL));
    const sdk = new OnlinePumpAmmSdk(connection);
    const state = await sdk.createPoolSolanaState(0, payer, mint, NATIVE_MINT);
    const poolIxs = await PUMP_AMM_SDK.createPoolInstructions(state, new BN(baseIn.toString()), new BN(quoteIn.toString()));
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    const tx = new Transaction({ feePayer: payer, recentBlockhash: blockhash }).add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }),
      ...poolIxs,
    );
    return NextResponse.json({
      transaction: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64"),
      mint: mint.toBase58(),
      quote: NATIVE_MINT.toBase58(),
      baseIn: baseIn.toString(),
      seedSol,
      bondingCurve: false,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not open the PumpSwap book." },
      { status: 400 },
    );
  }
}
