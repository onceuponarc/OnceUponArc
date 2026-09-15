import { NextResponse } from "next/server";
import { Transaction } from "@solana/web3.js";
import { getSessionUser } from "@/lib/auth";
import { listChatMessages, insertPendingMessage, updateMessageBurn, todaysSpendUsd, getSpendCap } from "@/lib/chat/store";
import { lamportsForUsd, buildOrbitxBurnIx } from "@/lib/solana/orbitx-burn";
import { deskSolanaKey } from "@/lib/wallets/sign-desk";
import { sendSignedTx, waitForTx } from "@/lib/solana/partial-tx";
import { fetchLatestBlockhash } from "@/lib/solana/blockhash";
import { serverSolanaRpcs } from "@/lib/solana/rpc-urls";

export const dynamic = "force-dynamic";
export const maxDuration = 45;

const BURN_USD = 0.05;

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const messages = await listChatMessages(slug);
  return NextResponse.json({ messages });
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const { user, profile } = await getSessionUser();
    if (!user || !profile) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });

    const body = (await request.json()) as { body?: string };
    const text = (body.body ?? "").trim();
    if (!text) return NextResponse.json({ error: "Say something first." }, { status: 400 });
    if (text.length > 500) return NextResponse.json({ error: "Keep it under 500 characters." }, { status: 400 });

    // Server-enforced cap — the client's spend counter is a courtesy display,
    // this check is what actually stops the spend.
    const [cap, spentToday] = await Promise.all([getSpendCap(user.id), todaysSpendUsd(user.id)]);
    if (!cap.enabled) {
      return NextResponse.json({ error: "Pay-to-chat is turned off for your account." }, { status: 400 });
    }
    if (spentToday + BURN_USD > cap.dailyCapUsd) {
      return NextResponse.json(
        {
          error: `Daily chat-burn cap reached ($${cap.dailyCapUsd.toFixed(2)}/day). Raise it in chat settings if you want to keep going today.`,
        },
        { status: 400 },
      );
    }

    const message = await insertPendingMessage({
      storySlug: slug,
      authorUserId: user.id,
      authorHandle: profile.handle,
      body: text,
      burnUsd: BURN_USD,
    });

    try {
      const payer = await deskSolanaKey(user.id);
      const lamports = await lamportsForUsd(BURN_USD);
      const { instructions, expectedBase } = await buildOrbitxBurnIx(payer, lamports);
      const tx = new Transaction().add(...instructions);
      const latest = await fetchLatestBlockhash(serverSolanaRpcs());
      tx.feePayer = payer.publicKey;
      tx.recentBlockhash = latest.blockhash;
      tx.sign(payer);
      const sig = await sendSignedTx(tx.serialize().toString("base64"));
      await waitForTx(sig);
      await updateMessageBurn(message.id, { status: "confirmed", lamports, tx: sig });
      return NextResponse.json({
        message: { ...message, burnStatus: "confirmed", burnTx: sig },
        burnedTokens: expectedBase.toString(),
      });
    } catch (burnError) {
      // The message itself still posts — a failed burn shouldn't silently eat
      // someone's words along with their money not moving. Card marked failed
      // so the UI can show "message posted, burn didn't go through" honestly.
      const reason = burnError instanceof Error ? burnError.message : "Burn failed.";
      await updateMessageBurn(message.id, { status: "failed", failReason: reason });
      return NextResponse.json({ message: { ...message, burnStatus: "failed", failReason: reason } }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not send that." },
      { status: 400 },
    );
  }
}
