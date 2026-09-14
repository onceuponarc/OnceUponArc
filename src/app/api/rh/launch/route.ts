import { NextResponse } from "next/server";
import { encodeFunctionData, keccak256, toHex, zeroAddress, zeroHash } from "viem";
import { getSessionUser } from "@/lib/auth";
import { deskRhWallet } from "@/lib/wallets/rh-client";
import { PONS_FACTORY, PONS_FACTORY_ABI } from "@/lib/rh/pons";
import { RH } from "@onceupon/config/rh";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { user, profile } = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const body = (await request.json()) as { name?: string; symbol?: string; coverUrl?: string };
    const name = (body.name ?? "").trim().slice(0, 32);
    const symbol = (body.symbol ?? "").trim().toUpperCase().slice(0, 12);
    if (!name || !symbol) return NextResponse.json({ error: "Name and ticker required." }, { status: 400 });

    const { wallet, pub, address } = await deskRhWallet(user.id);
    const balance = await pub.getBalance({ address });
    const fee = await pub.readContract({
      address: PONS_FACTORY,
      abi: PONS_FACTORY_ABI,
      functionName: "launchFee",
    });
    if (balance < fee) {
      return NextResponse.json(
        {
          error: `Fund your in-app Robinhood wallet. Need ETH at ${address} for the Pons launch fee + gas.`,
        },
        { status: 400 },
      );
    }

    const salt = keccak256(toHex(`${address}:${name}:${symbol}:${Date.now()}`));
    const data = encodeFunctionData({
      abi: PONS_FACTORY_ABI,
      functionName: "launchToken",
      args: [
        {
          name,
          symbol,
          logo: body.coverUrl ?? "",
          description: "Launched on OrbitX",
          socials: {
            twitter: profile?.handle ? `https://x.com/${profile.handle}` : "",
            telegram: "",
            discord: "",
            website: "https://www.orbitx.world",
            farcaster: "",
          },
          creatorFeeRecipient: address,
          creatorTaxBps: 100,
          buybackEnabled: false,
          expectedEconomics: zeroHash,
          salt,
        },
        0n,
        zeroAddress,
      ],
    });

    const hash = await wallet.sendTransaction({
      account: wallet.account,
      to: PONS_FACTORY,
      data,
      value: fee,
      chain: wallet.chain,
    });

    return NextResponse.json({
      hash,
      creator: address,
      feeRecipient: address,
      explorer: `${RH.explorer}/tx/${hash}`,
      venue: "pons-v2",
      note: "Pons v2 curve. Buy and sell from block one. Volume feeds the curve and graduates into a locked Uniswap v4 LP.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Robinhood launch failed." },
      { status: 400 },
    );
  }
}
