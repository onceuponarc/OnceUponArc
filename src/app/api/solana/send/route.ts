import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { explorerFromSig, sendSignedTx, waitForTx } from "@/lib/solana/partial-tx";
import { redactWalletError } from "@/lib/crypto/secret-box";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { user } = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });

    let body: { signedTx?: string };
    try {
      body = (await request.json()) as { signedTx?: string };
    } catch {
      return NextResponse.json({ error: "Signed transaction was empty. Retry." }, { status: 400 });
    }
    if (!body.signedTx) {
      return NextResponse.json({ error: "Missing signed transaction." }, { status: 400 });
    }

    const signature = await sendSignedTx(body.signedTx);
    await waitForTx(signature).catch(() => undefined);
    return NextResponse.json({ signature, explorer: explorerFromSig(signature) });
  } catch (error) {
    console.error("solana send failed", error);
    return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
  }
}
