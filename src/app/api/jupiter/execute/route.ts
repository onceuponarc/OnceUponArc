import { NextResponse } from "next/server";
import { VersionedTransaction } from "@solana/web3.js";
import { getSessionUser } from "@/lib/auth";
import { ensureSolanaWallet, loadUserKeypair } from "@/lib/wallets/embedded";
import { fetchJupiterSwap } from "@/lib/jupiter";
import { explorerTx, solanaConnection } from "@/lib/solana/connection";
import { redactWalletError } from "@/lib/crypto/secret-box";

export const maxDuration = 60;

export async function POST(request: Request) {
  const { user } = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in with X first. The pad wallet is created in Supabase." }, { status: 401 });
  }

  const body = (await request.json()) as { quoteResponse?: Record<string, unknown> };
  if (!body.quoteResponse) {
    return NextResponse.json({ error: "Get a Jupiter route first." }, { status: 400 });
  }

  try {
    const wallet = await ensureSolanaWallet(user.id);
    const { swapTransaction } = await fetchJupiterSwap({
      userPublicKey: wallet.address,
      quoteResponse: body.quoteResponse,
    });
    const tx = VersionedTransaction.deserialize(Buffer.from(swapTransaction, "base64"));
    const keypair = await loadUserKeypair(user.id);
    tx.sign([keypair]);
    const signature = await solanaConnection().sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    });
    return NextResponse.json({
      signature,
      explorer: explorerTx(signature),
      address: wallet.address,
    });
  } catch (error) {
    return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
  }
}
