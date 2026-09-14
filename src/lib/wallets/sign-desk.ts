import "server-only";

import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { loadArcNetwork } from "@/lib/arc/env";
import { arcChain } from "@/lib/arc/client";
import { exportDeskSecret, ensureDeskWallets } from "@/lib/wallets/multi";
import { loadUserKeypair } from "@/lib/wallets/embedded";

export async function deskEvmWallet(userId: string) {
  await ensureDeskWallets(userId);
  const { secret, address } = await exportDeskSecret(userId, "eth");
  const pk = (secret.startsWith("0x") ? secret : `0x${secret}`) as `0x${string}`;
  const account = privateKeyToAccount(pk);
  const net = loadArcNetwork();
  if (!net) throw new Error("Arc RPC is not set.");
  const wallet = createWalletClient({
    account,
    chain: arcChain(net),
    transport: http(net.rpcUrl),
  });
  return { wallet, address: account.address, net };
}

export async function deskSolanaKey(userId: string) {
  await ensureDeskWallets(userId);
  return loadUserKeypair(userId);
}

export { exportDeskSecret };
