export const SOLANA = {
  name: "Solana Mainnet",
  cluster: "mainnet-beta" as const,
  caip2: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  explorer: "https://explorer.solana.com",
  rpcUrl: "https://api.mainnet-beta.solana.com",
  nativeSymbol: "SOL",
  defaultDecimals: 6,
  nftDecimals: 0,
  defaultSupply: 1_000_000_000,
  bondingGraduationSol: 2,
  virtualQuoteSol: 30,
  protocolBpsDefault: 20,
  /** Circle USDC on Solana mainnet. */
  usdcMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
} as const;

export const ROBINHOOD_CHAIN = {
  name: "Robinhood Chain",
  chainId: 4663,
  caip2: "eip155:4663",
  note: "Pons v2 factory lives here. Same launch types ship when the public RPC is wired.",
  ponsFactory: "0x7ed598bcef8bd9edd8c97a195c6d13f40801ec7e",
  ponsRouter: "0xe33e9e479df8802cb0866d5d05258bec4cf62948",
} as const;

export type LaunchChain = "solana" | "arc" | "robinhood";
export type LaunchVenue = "spl" | "nft" | "pumpfun" | "pons";
export type QuoteKind = "sol" | "usdc" | "meme" | "stock" | "custom";

export const CHAINS: {
  id: LaunchChain;
  title: string;
  live: boolean;
  prints: boolean;
  badge: string;
  body: string;
}[] = [
  {
    id: "solana",
    title: "Solana",
    live: true,
    prints: true,
    badge: "Live · mainnet",
    body: "SPL coins, NFTs, Pump.fun-style curves, and Pons-style pairs. Real mainnet mints. Fund the pad wallet with SOL.",
  },
  {
    id: "arc",
    title: "Circle Arc",
    live: true,
    prints: false,
    badge: "Live · testnet",
    body: "Arc testnet is live for wallets, gas USDC, pool USDC, and EURC. The token factory is not deployed yet — print Stories on Solana mainnet.",
  },
  {
    id: "robinhood",
    title: "Robinhood Chain",
    live: false,
    prints: false,
    badge: "Coming soon",
    body: "Native Pons factory for tokenized-name quotes. Prepare the same launch here; it prints when the chain is wired.",
  },
];

export const VENUES: {
  id: LaunchVenue;
  title: string;
  headline: string;
  body: string;
}[] = [
  {
    id: "spl",
    title: "SPL coin",
    headline: "Mint a real Solana token",
    body: "Fixed supply on an OnceUpon bonding curve. Trade against SOL, a meme mint, or a custom mint.",
  },
  {
    id: "nft",
    title: "NFT",
    headline: "1/1 or editions",
    body: "Decimals zero. Supply one for a 1/1, or more for editions. Metadata lives with the mint.",
  },
  {
    id: "pumpfun",
    title: "Pump.fun",
    headline: "Pump-style curve on Solana",
    body: "Same buy/sell shape as Pump.fun. Prints on Solana mainnet today. PumpPortal stays opt-in.",
  },
  {
    id: "pons",
    title: "Pons",
    headline: "Pons-style pair launch",
    body: "Bonding plus a quote/reward pair — meme, custom mint, or a tokenized name. Native Pons is Robinhood Chain; Solana runs the same flow now.",
  },
];
