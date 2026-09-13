import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { buildPumpSwapPair, confirmPumpSwapPair, waitPairTx } from "@/lib/solana/pumpswap-pool";
import { redactWalletError } from "@/lib/crypto/secret-box";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type PairBody = {
  action?: "build" | "wait" | "confirm";
  payer?: string;
  quoteMint?: string | null;
  quoteUi?: number;
  baseBps?: number;
  recentBlockhash?: string;
  signature?: string;
  pool?: string;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { user } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  const { slug } = await context.params;

  let body: PairBody;
  try {
    body = (await request.json()) as PairBody;
  } catch {
    return NextResponse.json({ error: "Pair request was empty." }, { status: 400 });
  }

  try {
    if (body.action === "wait") {
      if (!body.signature) {
        return NextResponse.json({ error: "Wait needs a signature." }, { status: 400 });
      }
      const result = await waitPairTx(body.signature);
      return NextResponse.json(result);
    }
    if (body.action === "confirm") {
      if (!body.signature || !body.pool) {
        return NextResponse.json({ error: "Confirmation needs a signature and pool." }, { status: 400 });
      }
      const result = await confirmPumpSwapPair({
        userId: user.id,
        slug,
        signature: body.signature,
        pool: body.pool,
        quoteMint: body.quoteMint,
      });
      return NextResponse.json(result);
    }

    const result = await buildPumpSwapPair({
      userId: user.id,
      slug,
      payer: body.payer,
      quoteMint: body.quoteMint,
      quoteUi: Number(body.quoteUi ?? 0),
      baseBps: body.baseBps == null ? undefined : Number(body.baseBps),
      recentBlockhash: body.recentBlockhash,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("pair route failed", error);
    return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
  }
}
