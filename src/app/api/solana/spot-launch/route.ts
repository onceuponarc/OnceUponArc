import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { buildSpotMintTx } from "@/lib/solana/spot-mint";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { profile } = await getSessionUser();
    if (!profile) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const body = (await request.json()) as {
      publicKey?: string;
      name?: string;
      symbol?: string;
      program?: "spl" | "token2022";
      mode?: "direct" | "fair";
      taxBps?: number;
      vanity?: boolean;
    };
    if (!body.publicKey) return NextResponse.json({ error: "Connect Phantom first." }, { status: 400 });
    if (!body.name?.trim() || !body.symbol?.trim()) {
      return NextResponse.json({ error: "Name and ticker required." }, { status: 400 });
    }
    const built = await buildSpotMintTx({
      payer: body.publicKey,
      name: body.name.trim(),
      symbol: body.symbol.trim().toUpperCase(),
      program: body.program,
      mode: body.mode,
      taxBps: body.taxBps,
      vanity: body.vanity,
    });
    return NextResponse.json(built);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not build the spot mint." },
      { status: 400 },
    );
  }
}
