import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureSolanaWallet, solBalance } from "@/lib/wallets/embedded";
import { redactWalletError } from "@/lib/crypto/secret-box";
import { explorerAddress } from "@/lib/solana/connection";

export async function GET() {
  const { user } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  try {
    const wallet = await ensureSolanaWallet(user.id);
    const balance = await solBalance(wallet.address);
    return NextResponse.json({
      address: wallet.address,
      balance,
      created: wallet.created,
      explorer: explorerAddress(wallet.address),
      chain: "solana",
    });
  } catch (error) {
    return NextResponse.json({ error: redactWalletError(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { user } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { action?: string };
  try {
    const wallet = await ensureSolanaWallet(user.id);
    if (body.action === "airdrop") {
      return NextResponse.json(
        { error: "Solana mainnet has no faucet. Send SOL to this pad wallet." },
        { status: 400 },
      );
    }
    return NextResponse.json({ address: wallet.address, created: wallet.created });
  } catch (error) {
    return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
  }
}
