import { NextResponse } from "next/server";
import { arcStatus } from "@/lib/arc/chapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const status = await arcStatus();
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { ready: false, error: error instanceof Error ? error.message : "Arc Devnet is down." },
      { status: 200 },
    );
  }
}
