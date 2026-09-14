import "server-only";

import { createPublicClient, createWalletClient, defineChain, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { RH } from "@onceupon/config/rh";
import { ensureDeskWallets, exportDeskSecret } from "@/lib/wallets/multi";

export const rhChain = defineChain({
  id: RH.chainId,
  name: RH.name,
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [RH.rpcUrl] } },
  blockExplorers: { default: { name: "Blockscout", url: RH.explorer } },
});

export async function deskRhWallet(userId: string) {
  await ensureDeskWallets(userId);
  const { secret, address } = await exportDeskSecret(userId, "rh");
  const pk = (secret.startsWith("0x") ? secret : `0x${secret}`) as `0x${string}`;
  const account = privateKeyToAccount(pk);
  const wallet = createWalletClient({
    account,
    chain: rhChain,
    transport: http(RH.rpcUrl),
  });
  const pub = createPublicClient({ chain: rhChain, transport: http(RH.rpcUrl) });
  return { wallet, pub, address: account.address as `0x${string}` };
}
