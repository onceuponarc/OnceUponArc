import { NextResponse } from "next/server";
import { fetchLatestBlockhash } from "@/lib/solana/blockhash";
import { serverSolanaRpcs } from "@/lib/solana/rpc-urls";
import { redactWalletError } from "@/lib/crypto/secret-box";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const latest = await fetchLatestBlockhash(serverSolanaRpcs());
    return NextResponse.json(latest);
  } catch (error) {
    return NextResponse.json({ error: redactWalletError(error) }, { status: 502 });
  }
}
