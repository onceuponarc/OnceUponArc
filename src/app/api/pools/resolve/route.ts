import { NextResponse } from "next/server";
import { isLaunchChain } from "@onceupon/config/solana";
import { resolvePools } from "@/lib/pools/resolve";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const chain = url.searchParams.get("chain") ?? "solana";
  if (!isLaunchChain(chain)) {
    return NextResponse.json({ error: "Unknown chain." }, { status: 400 });
  }
  try {
    const result = await resolvePools({
      chain,
      quoteId: url.searchParams.get("quoteId") ?? undefined,
      quoteMint: url.searchParams.get("mint") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not resolve pools." },
      { status: 502 },
    );
  }
}
