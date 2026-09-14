/** Uniswap v4 launch rails on Arc. Addresses from ubi.fun / Flaunch zap on 5042. */
export const ARC_V4 = {
  chainId: 5042,
  hexChainId: "0x13B2",
  usdc: "0x3600000000000000000000000000000000000000" as const,
  flaunchZap: "0xe07F7cA66EC795592385018Dd998F0B50b8A2834" as const,
  fairLaunch: "0xdCDADa707264d9e2B0E8c2feC467860C97434Bd4" as const,
  bidWall: "0xC5DD30802fefab789Cd9b1e835Bd7301a8D23F8A" as const,
  positionManager: "0xC780c0f4aAc690908854D351b8bFda2812daeFDc" as const,
  poolSwap: "0x3A61B6E86fde5Fc657a48819837F346C7E2Fffa7" as const,
  flaunch: "0x93E5A7565008db9688BA5211Fa552d8b108B9c75" as const,
  explorer: "https://arcscan.app",
} as const;

export const FLAUNCH_ZAP_ABI = [
  {
    type: "function",
    name: "flaunch",
    stateMutability: "payable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "symbol", type: "string" },
          { name: "tokenUri", type: "string" },
          { name: "initialTokenFairLaunch", type: "uint256" },
          { name: "fairLaunchDuration", type: "uint256" },
          { name: "premineAmount", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "creatorFeeAllocation", type: "uint24" },
          { name: "flaunchAt", type: "uint256" },
          { name: "initialPriceParams", type: "bytes" },
          { name: "feeCalculatorParams", type: "bytes" },
        ],
      },
    ],
    outputs: [{ name: "memecoin", type: "address" }],
  },
] as const;
