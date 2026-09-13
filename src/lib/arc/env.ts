import "server-only";

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ARC_TESTNET } from "@onceupon/config/arc";

/** Well-known Anvil account #1. Test funds only — never send mainnet value here. */
export const ANVIL_DEPLOYER = {
  address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as const,
  privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as const,
};

export const ANVIL_TRADER = {
  address: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as const,
  privateKey: "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d" as const,
};

export type ArcNetworkFile = {
  label: string;
  rpcUrl: string;
  chainId: number;
  factory: `0x${string}`;
  usdc: `0x${string}`;
  trader: `0x${string}`;
  deployer: `0x${string}`;
  explorer: string;
  nativeGas: "usdc" | "eth";
};

const FILE = process.env.ARC_DEVNET_FILE || join(process.cwd(), "data", "arc-devnet.json");

export function loadArcNetwork(): ArcNetworkFile | null {
  if (process.env.ARC_FACTORY && process.env.ARC_USDC) {
    const chainId = Number(process.env.ARC_CHAIN_ID || 31337);
    return {
      label: chainId === ARC_TESTNET.chainId ? "Arc Testnet" : "Arc Devnet",
      rpcUrl: process.env.ARC_RPC_URL || "http://127.0.0.1:8546",
      chainId,
      factory: process.env.ARC_FACTORY as `0x${string}`,
      usdc: process.env.ARC_USDC as `0x${string}`,
      trader: (process.env.ARC_TRADER as `0x${string}`) || ANVIL_TRADER.address,
      deployer: (process.env.ARC_DEPLOYER as `0x${string}`) || ANVIL_DEPLOYER.address,
      explorer: process.env.ARC_EXPLORER || ARC_TESTNET.explorer,
      nativeGas: chainId === ARC_TESTNET.chainId ? "usdc" : "eth",
    };
  }
  if (!existsSync(FILE)) return null;
  try {
    return JSON.parse(readFileSync(FILE, "utf8")) as ArcNetworkFile;
  } catch {
    return null;
  }
}

export function traderPrivateKey(): `0x${string}` {
  return (process.env.ARC_DEV_PRIVATE_KEY as `0x${string}` | undefined) || ANVIL_TRADER.privateKey;
}

export function deployerPrivateKey(): `0x${string}` {
  return (process.env.ARC_DEPLOYER_PRIVATE_KEY as `0x${string}` | undefined) || ANVIL_DEPLOYER.privateKey;
}

export function arcDevnetPath() {
  return FILE;
}
