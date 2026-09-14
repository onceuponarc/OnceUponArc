import { NextResponse } from "next/server";
import { encodeAbiParameters, encodeFunctionData, parseAbiParameters } from "viem";
import { getSessionUser } from "@/lib/auth";
import { deskEvmWallet } from "@/lib/wallets/sign-desk";
import { ARC_V4, FLAUNCH_ZAP_ABI } from "@onceupon/config/ubi-v4";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { user, profile } = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const body = (await request.json()) as {
      name?: string;
      symbol?: string;
      mode?: "direct" | "fair";
      coverUrl?: string;
      xHandle?: string;
    };
    const name = (body.name ?? "").trim();
    const symbol = (body.symbol ?? "").trim().toUpperCase();
    if (!name || !symbol) return NextResponse.json({ error: "Name and ticker required." }, { status: 400 });
    const { wallet, address } = await deskEvmWallet(user.id);
    const mode = body.mode === "fair" ? "fair" : "direct";
    const supply = 1_000_000_000n * 10n ** 18n;
    const fairPercent = mode === "fair" ? 50n : 0n;
    const data = encodeFunctionData({
      abi: FLAUNCH_ZAP_ABI,
      functionName: "flaunch",
      args: [
        {
          name,
          symbol,
          tokenUri: JSON.stringify({
            name,
            symbol,
            image: body.coverUrl ?? "",
            launchpad: "OrbitX",
            creatorX: body.xHandle ?? (profile?.handle ? `@${profile.handle}` : ""),
            mode,
          }),
          initialTokenFairLaunch: (supply * fairPercent) / 100n,
          fairLaunchDuration: mode === "fair" ? 30n * 60n : 0n,
          premineAmount: 0n,
          creator: address,
          creatorFeeAllocation: 10000,
          flaunchAt: 0n,
          initialPriceParams: encodeAbiParameters(parseAbiParameters("uint256"), [6_900n * 10n ** 6n]),
          feeCalculatorParams: mode === "fair" ? encodeAbiParameters(parseAbiParameters("bool"), [true]) : "0x",
        },
      ],
    });
    const hash = await wallet.sendTransaction({
      account: wallet.account,
      to: ARC_V4.flaunchZap,
      data,
      chain: wallet.chain,
    });
    return NextResponse.json({
      hash,
      creator: address,
      feeRecipient: address,
      note: "Signed by your in-app Arc wallet. Fund that address with USDC to pay gas. Fees route to it.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "V4 launch failed." },
      { status: 400 },
    );
  }
}
