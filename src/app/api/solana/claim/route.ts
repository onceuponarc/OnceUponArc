import { NextResponse } from "next/server";
import { VersionedTransaction } from "@solana/web3.js";
import { getSessionUser } from "@/lib/auth";
import { pumpCollectFeeTx } from "@/lib/solana/pumpportal";
import { sendSignedTx, waitForTx, explorerFromSig } from "@/lib/solana/partial-tx";
import { deskSolanaKey } from "@/lib/wallets/sign-desk";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  try {
    const { user } = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const payer = await deskSolanaKey(user.id);
    const built = await pumpCollectFeeTx(payer.publicKey.toBase58());
    const tx = VersionedTransaction.deserialize(Buffer.from(built, "base64"));
    tx.sign([payer]);
    const signature = await sendSignedTx(Buffer.from(tx.serialize()).toString("base64"));
    await waitForTx(signature);
    return NextResponse.json({ signature, explorer: explorerFromSig(signature), creator: payer.publicKey.toBase58() });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Claim failed." },
      { status: 400 },
    );
  }
}
