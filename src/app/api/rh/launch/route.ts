import { NextResponse } from "next/server";
import { encodeDeployData } from "viem";
import { getSessionUser } from "@/lib/auth";
import { deskRhWallet } from "@/lib/wallets/rh-client";
import { ORBITX_SPOT_ABI, ORBITX_SPOT_BYTECODE } from "@/lib/rh/spot-bytecode";
import { RH } from "@onceupon/config/rh";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { user } = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const body = (await request.json()) as { name?: string; symbol?: string; coverUrl?: string };
    const name = (body.name ?? "").trim().slice(0, 32);
    const symbol = (body.symbol ?? "").trim().toUpperCase().slice(0, 12);
    if (!name || !symbol) return NextResponse.json({ error: "Name and ticker required." }, { status: 400 });

    const { wallet, pub, address } = await deskRhWallet(user.id);
    const balance = await pub.getBalance({ address });
    if (balance === 0n) {
      return NextResponse.json(
        {
          error: `Fund your in-app Robinhood wallet with ETH first. Send ETH to ${address}. That key pays gas, signs the mint, and receives fees.`,
        },
        { status: 400 },
      );
    }

    const data = encodeDeployData({
      abi: ORBITX_SPOT_ABI,
      bytecode: ORBITX_SPOT_BYTECODE,
      args: [name, symbol, address],
    });
    const hash = await wallet.sendTransaction({
      account: wallet.account,
      data,
      chain: wallet.chain,
    });
    const receipt = await pub.waitForTransactionReceipt({ hash });
    const token = receipt.contractAddress;
    if (!token) throw new Error("Mint did not return a token address.");

    return NextResponse.json({
      hash,
      token,
      creator: address,
      feeRecipient: address,
      explorer: `${RH.explorer}/token/${token}`,
      note: "No bonding curve. 1B supply is in your in-app RH wallet. Token is transferable now. Seed WETH against it on Uniswap to deepen the book.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Robinhood launch failed." },
      { status: 400 },
    );
  }
}


