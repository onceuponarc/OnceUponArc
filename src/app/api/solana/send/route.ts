import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { explorerFromSig, sendSignedTx, waitForTx } from "@/lib/solana/partial-tx";
import { redactWalletError } from "@/lib/crypto/secret-box";

export const maxDuration = 60;

export async function POST(request: Request) {
  const { user } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });

  const body = (await request.json()) as { signedTx?: string };
  if (!body.signedTx) {
    return NextResponse.json({ error: "Missing signed transaction." }, { status: 400 });
  }

  try {
    const signature = await sendSignedTx(body.signedTx);
    await waitForTx(signature).catch(() => undefined);
    return NextResponse.json({ signature, explorer: explorerFromSig(signature) });
  } catch (error) {
    return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
  }
}
