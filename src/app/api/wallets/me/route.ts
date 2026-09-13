import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getBoundSolanaWallet, solBalance } from "@/lib/wallets/bound";
import { explorerAddress } from "@/lib/solana/explorer";
import { redactWalletError } from "@/lib/crypto/secret-box";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { user } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });

  try {
    const address = await getBoundSolanaWallet(user.id);
    if (!address) {
      return NextResponse.json({ address: null, bound: false });
    }
    const balance = await solBalance(address).catch(() => null);
    return NextResponse.json({
      address,
      bound: true,
      balance,
      explorer: explorerAddress(address),
      chain: "solana",
    });
  } catch (error) {
    return NextResponse.json({ error: redactWalletError(error) }, { status: 500 });
  }
}
