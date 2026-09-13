import { NextResponse } from "next/server";
import { dripFaucet } from "@/lib/arc/chapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await dripFaucet();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Faucet failed." },
      { status: 400 },
    );
  }
}
