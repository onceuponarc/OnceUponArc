import { NextResponse } from "next/server";
import { createPublicClient, formatEther, formatUnits, http } from "viem";
import { mainnet } from "viem/chains";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getSessionUser } from "@/lib/auth";
import { ensureDeskWallets } from "@/lib/wallets/multi";
import { solanaConnection } from "@/lib/solana/connection";
import { SOLANA } from "@onceupon/config/solana";
import { loadArcNetwork } from "@/lib/arc/env";
import { RH } from "@onceupon/config/rh";
import { rhChain } from "@/lib/wallets/rh-client";

export const dynamic = "force-dynamic";

const ERC20 = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

const ETH_USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as const;

async function tokenUi(pub: ReturnType<typeof createPublicClient>, token: `0x${string}`, owner: `0x${string}`, decimals: number) {
  try {
    const raw = await pub.readContract({ address: token, abi: ERC20, functionName: "balanceOf", args: [owner] });
    return Number(formatUnits(raw, decimals));
  } catch {
    return 0;
  }
}

export async function GET() {
  try {
    const { user } = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const desk = await ensureDeskWallets(user.id);
    const sol = desk.wallets.solana;
    const evm = desk.wallets.eth as `0x${string}` | null;
    const rh = desk.wallets.rh as `0x${string}` | null;

    const solanaHoldings = { address: sol, sol: 0, usdc: 0 };
    if (sol) {
      try {
        const conn = solanaConnection();
        const pk = new PublicKey(sol);
        solanaHoldings.sol = (await conn.getBalance(pk, "confirmed")) / 1e9;
        const ata = getAssociatedTokenAddressSync(new PublicKey(SOLANA.usdcMint), pk, false, TOKEN_PROGRAM_ID);
        const ataInfo = await conn.getTokenAccountBalance(ata).catch(() => null);
        solanaHoldings.usdc = ataInfo ? Number(ataInfo.value.uiAmount ?? 0) : 0;
      } catch {
        /* rpc */
      }
    }

    const ethHoldings = { address: evm, eth: 0, usdc: 0 };
    if (evm) {
      try {
        const pub = createPublicClient({ chain: mainnet, transport: http("https://eth.llamarpc.com") });
        ethHoldings.eth = Number(formatEther(await pub.getBalance({ address: evm })));
        ethHoldings.usdc = await tokenUi(pub, ETH_USDC, evm, 6);
      } catch {
        /* rpc */
      }
    }

    const net = loadArcNetwork();
    const arcHoldings = { address: evm, usdc: 0, rpc: net?.rpcUrl ?? null };
    if (evm && net?.rpcUrl) {
      try {
        const pub = createPublicClient({ transport: http(net.rpcUrl) });
        arcHoldings.usdc = Number(formatEther(await pub.getBalance({ address: evm })));
      } catch {
        /* rpc */
      }
    }

    const rhHoldings = { address: rh, eth: 0, usdg: 0 };
    if (rh) {
      try {
        const pub = createPublicClient({ chain: rhChain, transport: http(RH.rpcUrl) });
        rhHoldings.eth = Number(formatEther(await pub.getBalance({ address: rh })));
        rhHoldings.usdg = await tokenUi(pub, RH.usdg, rh, 6);
      } catch {
        /* rpc */
      }
    }

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      solana: solanaHoldings,
      ethereum: ethHoldings,
      arc: arcHoldings,
      robinhood: rhHoldings,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not read balances." },
      { status: 400 },
    );
  }
}
