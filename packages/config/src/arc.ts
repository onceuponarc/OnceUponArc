export type Amount = {
  atomic: bigint;
  decimals: number;
  asset: string;
};

export const ARC_TESTNET = {
  name: "Arc Testnet",
  chainId: 5042002,
  hexChainId: "0x4CEF52",
  caip2: "eip155:5042002",
  nativeCurrency: {
    name: "USDC",
    symbol: "USDC",
    decimals: 18,
  },
  usdcNativeDecimals: 18,
  usdcErc20: "0x3600000000000000000000000000000000000000" as const,
  usdcErc20Decimals: 6,
  eurc: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a" as const,
  rpcUrls: [
    "https://rpc.testnet.arc.io",
    "https://rpc.testnet.arc.network",
    "https://rpc.blockdaemon.testnet.arc.io",
    "https://rpc.drpc.testnet.arc.io",
    "https://rpc.quicknode.testnet.arc.io",
  ],
  wsUrls: ["wss://rpc.testnet.arc.io", "wss://rpc.testnet.arc.network"],
  explorer: "https://testnet.arcscan.app",
  faucet: "https://faucet.circle.com",
  cctp: {
    tokenMessengerV2: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
    messageTransmitterV2: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
    tokenMinterV2: "0xb43db544E2c27092c107639Ad201b3dEfAbcF192",
    messageV2: "0xbaC0179bB358A8936169a63408C8481D582390C4",
  },
  gateway: {
    wallet: "0x0077777d7EBA4688BDeF3E311b846F25870A19B9",
    minter: "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B",
  },
  factory: null as `0x${string}` | null,
  router: null as `0x${string}` | null,
  vaultImpl: null as `0x${string}` | null,
  feeHook: null as `0x${string}` | null,
} as const;

export const ARC_MAINNET_PENDING = {
  name: "Arc",
  chainId: 1243,
  hexChainId: "0x4DB",
  caip2: "eip155:1243",
  note: "Confirm against docs.arc.io at cutover. Do not send real USDC until official RPC and addresses are published.",
} as const;

export const PROTOCOL = {
  protocolBpsDefault: 20,
  protocolBpsMin: 10,
  protocolBpsMax: 30,
  authorModeAuthorBpsCap: 300,
  onceuponersAuthorBpsCap: 100,
  authorModeSuggestedBps: 100,
  defaultSupply: BigInt("1000000000"),
  defaultDecimals: 18,
  bondingGraduationUsdc: 5_000,
} as const;

export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

export function authorFeeExample(buyUsdc: number, authorBps: number): number {
  return (buyUsdc * authorBps) / 10_000;
}
