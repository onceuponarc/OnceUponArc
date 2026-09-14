import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { buildTaxMintTx } from "@/lib/solana/tax-mint";

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
      taxBps?: number;
      vanity?: boolean;
    };
    const publicKey = (body.publicKey ?? "").trim();
    const name = (body.name ?? "").trim();
    const symbol = (body.symbol ?? "").trim().toUpperCase();
    if (!publicKey) return NextResponse.json({ error: "Connect Phantom first." }, { status: 400 });
    if (!name || !symbol) return NextResponse.json({ error: "Name and ticker required." }, { status: 400 });
    const built = await buildTaxMintTx({
      payer: publicKey,
      name,
      symbol,
      taxBps: body.taxBps,
      vanity: body.vanity,
    });
    return NextResponse.json(built);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not build the tax mint." },
      { status: 400 },
    );
  }
}
