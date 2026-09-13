import { NextResponse } from "next/server";
import { dripFaucet } from "@/lib/arc/chapter";
import { isAddress } from "viem";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    let address: `0x${string}` | undefined;
    try {
      const body = (await request.json()) as { address?: string };
      if (body.address && isAddress(body.address)) address = body.address;
    } catch {
      address = undefined;
    }
    const result = await dripFaucet(address);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Faucet failed." },
      { status: 400 },
    );
  }
}
