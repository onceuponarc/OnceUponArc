import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { ensureDeskWallets, exportDeskSecret, importDeskSecret, type DeskChain } from "@/lib/wallets/multi";

export const dynamic = "force-dynamic";

const CHAINS: DeskChain[] = ["solana", "eth", "rh"];

export async function GET() {
  const { user } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  try {
    const desk = await ensureDeskWallets(user.id);
    return NextResponse.json(desk);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not open the desk." },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  const { user } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  const body = (await request.json()) as { action?: string; chain?: string; secret?: string };
  const chain = body.chain as DeskChain;
  if (!CHAINS.includes(chain)) return NextResponse.json({ error: "Unknown chain." }, { status: 400 });
  try {
    if (body.action === "export") {
      const out = await exportDeskSecret(user.id, chain);
      return NextResponse.json(out);
    }
    if (body.action === "import") {
      if (!body.secret) return NextResponse.json({ error: "Paste a secret." }, { status: 400 });
      const out = await importDeskSecret(user.id, chain, body.secret.trim());
      return NextResponse.json(out);
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Wallet action failed." },
      { status: 400 },
    );
  }
}
