import { NextResponse } from "next/server";
import { isLaunchChain, type LaunchVenue } from "@onceupon/config/solana";
import { preferDexForVenue } from "@onceupon/config/launchpad";
import { resolvePools } from "@/lib/pools/resolve";
import type { DexId } from "@onceupon/config/pools";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const chain = url.searchParams.get("chain") ?? "solana";
  if (!isLaunchChain(chain)) {
    return NextResponse.json({ error: "Unknown chain." }, { status: 400 });
  }
  try {
    const venue = url.searchParams.get("venue") as LaunchVenue | null;
    const prefer = (url.searchParams.get("preferDex") as DexId | null) || preferDexForVenue(venue ?? "spl");
    const result = await resolvePools({
      chain,
      quoteId: url.searchParams.get("quoteId") ?? undefined,
      quoteMint: url.searchParams.get("mint") ?? undefined,
      preferDex: prefer,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not resolve pools." },
      { status: 502 },
    );
  }
}
