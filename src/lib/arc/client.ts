import "server-only";

import { createPublicClient, createWalletClient, http, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { defineChain } from "viem";
import { assertUnblockedSigner, deployerPrivateKey, loadArcNetwork, traderPrivateKey, type ArcNetworkFile } from "@/lib/arc/env";

export function requireArcNetwork(): ArcNetworkFile {
  const net = loadArcNetwork();
  if (!net?.factory || !net.usdc) {
    throw new Error("Arc Devnet is not wired. Start Anvil and deploy the Chapter Factory.");
  }
  return net;
}

export function arcChain(net: ArcNetworkFile) {
  return defineChain({
    id: net.chainId,
    name: net.label,
    nativeCurrency: {
      name: net.nativeGas === "usdc" ? "USDC" : "ETH",
      symbol: net.nativeGas === "usdc" ? "USDC" : "ETH",
      decimals: 18,
    },
    rpcUrls: { default: { http: [net.rpcUrl] } },
  });
}

export function publicArc(net = requireArcNetwork()) {
  return createPublicClient({
    chain: arcChain(net),
    transport: http(net.rpcUrl),
  });
}

export function traderWallet(net = requireArcNetwork()) {
  const account = privateKeyToAccount(traderPrivateKey());
  assertUnblockedSigner(account.address);
  return createWalletClient({
    account,
    chain: arcChain(net),
    transport: http(net.rpcUrl),
  });
}

export function deployerWallet(net = requireArcNetwork()) {
  const account = privateKeyToAccount(deployerPrivateKey());
  return createWalletClient({
    account,
    chain: arcChain(net),
    transport: http(net.rpcUrl),
  });
}

export function asHex(value: string): Hex {
  return value as Hex;
}
