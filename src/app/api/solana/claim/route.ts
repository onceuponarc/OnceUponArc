import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { pumpCollectFeeTx } from "@/lib/solana/pumpportal";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { profile } = await getSessionUser();
    if (!profile) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const body = (await request.json()) as { publicKey?: string };
    const publicKey = (body.publicKey ?? "").trim();
    if (!publicKey) return NextResponse.json({ error: "Connect the creator wallet." }, { status: 400 });
    const transaction = await pumpCollectFeeTx(publicKey);
    return NextResponse.json({ transaction });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Claim failed." },
      { status: 400 },
    );
  }
}
