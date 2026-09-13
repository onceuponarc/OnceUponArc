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
  /** Wrapped SOL mint used by Jupiter routes. */
  wsolMint: "So11111111111111111111111111111111111111112",
} as const;

export const JUPITER = {
  name: "Jupiter",
  quoteUrl: "https://lite-api.jup.ag/swap/v1/quote",
  swapUrl: "https://lite-api.jup.ag/swap/v1/swap",
  app: "https://jup.ag",
  perps: "https://jup.ag/perps",
  docs: "https://dev.jup.ag/docs/swap",
} as const;

export const ROBINHOOD_CHAIN = {
  name: "Robinhood Chain",
  chainId: 4663,
  caip2: "eip155:4663",
  explorer: "https://robinhoodchain.blockscout.com",
  rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
  note: "Pons v2 factory is live here. Same launch types ship on Solana today; bind the Pons pool at launch.",
  ponsFactory: "0x7ed598bcef8bd9edd8c97a195c6d13f40801ec7e",
  ponsRouter: "0xe33e9e479df8802cb0866d5d05258bec4cf62948",
} as const;

export const ETHEREUM = {
  name: "Ethereum",
  chainId: 1,
  caip2: "eip155:1",
  explorer: "https://etherscan.io",
  rpcUrl: "https://eth.llamarpc.com",
} as const;

export const BASE = {
  name: "Base",
  chainId: 8453,
  caip2: "eip155:8453",
  explorer: "https://basescan.org",
  rpcUrl: "https://mainnet.base.org",
} as const;

export type LaunchChain = "arc" | "solana" | "ethereum" | "base" | "robinhood";
export type PrintableChain = LaunchChain;
export type LaunchVenue = "spl" | "nft" | "pumpfun" | "pons";
export type QuoteKind = "sol" | "usdc" | "meme" | "stock" | "etf" | "treasury" | "bond" | "custom";

export const PRINTABLE_CHAIN_IDS: readonly PrintableChain[] = [
  "arc",
  "solana",
  "ethereum",
  "base",
  "robinhood",
];

export type ChainCard = {
  id: LaunchChain;
  title: string;
  live: boolean;
  prints: boolean;
  badge: string;
  body: string;
  caip2: string;
  accent: string;
  printNote: string;
};

export const CHAINS: ChainCard[] = [
  {
    id: "arc",
    title: "Arc",
    live: true,
    prints: true,
    badge: "Home chain",
    body: "OnceUpon lives on Arc. Launch here, pair into any Solana-deep asset — BTC, stocks, memes, stables — and link a Uniswap pool on Arc mainnet (chain 5042) at print.",
    caip2: "eip155:5042002",
    accent: "from-[#3ee0c6]/45 to-[#6d7cff]/25",
    printNote:
      "Tagged for Arc. The mint prints as SPL on Solana so it is live against the Raydium/Orca/Meteora pool you pick. Native Arc Uniswap V2/V3 factories on chain 5042 bind at launch.",
  },
  {
    id: "solana",
    title: "Solana",
    live: true,
    prints: true,
    badge: "Live printer",
    body: "The working printer. Full SPL coins, NFTs, optional PumpSwap pairing, and Pons-style pairs mint here now. Pair against SOL, cbBTC, USDC, memes, stocks, ETFs, treasuries, bonds, or any mint, and link a live Raydium, Orca, Meteora, or PumpSwap pool.",
    caip2: SOLANA.caip2,
    accent: "from-[#9945ff]/40 to-[#14f195]/25",
    printNote:
      "Mints a real SPL token on Solana mainnet. Your connected wallet pays rent. After print, sign and pay PumpSwap create_pool so the mint has on-chain LP.",
  },
  {
    id: "ethereum",
    title: "Ethereum",
    live: true,
    prints: true,
    badge: "Open · tagged",
    body: "Pick Ethereum as the Story’s home chain. The token still prints on Solana today so it is live immediately. Link a Uniswap V2/V3 pool at launch.",
    caip2: ETHEREUM.caip2,
    accent: "from-[#627eea]/40 to-[#8a92b2]/20",
    printNote:
      "Prints as an SPL token on Solana mainnet and is tagged for Ethereum. Pick a Uniswap pool (or paste any pair) when you launch — it is bound on the Story immediately.",
  },
  {
    id: "base",
    title: "Base",
    live: true,
    prints: true,
    badge: "Open · tagged",
    body: "Same engines, tagged for Base. The mint lands on Solana now. Link a Uniswap or Aerodrome pool at launch.",
    caip2: BASE.caip2,
    accent: "from-[#0052ff]/40 to-[#7aa7ff]/20",
    printNote:
      "Prints as an SPL token on Solana mainnet and is tagged for Base. Pick a Uniswap or Aerodrome pool when you launch.",
  },
  {
    id: "robinhood",
    title: "Robinhood Chain",
    live: true,
    prints: true,
    badge: "Open · Pons tagged",
    body: "Pons-style launches tagged for Robinhood Chain. The token prints on Solana today. Link the Pons factory pool at launch via RPC https://rpc.mainnet.chain.robinhood.com.",
    caip2: ROBINHOOD_CHAIN.caip2,
    accent: "from-[#00c805]/35 to-[#c9a227]/20",
    printNote:
      "Prints as an SPL token on Solana mainnet and is tagged for Robinhood Chain / Pons. Pick or paste a Pons pool — factory 0x7ed598… — when you launch.",
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
    headline: "Full Solana token",
    body: "The real printer. You set supply, decimals, metadata, start price, and tokenomics. Pair against a stock, ETF, treasury, bond, SOL, or any live pool. This is not Pump.fun.",
  },
  {
    id: "nft",
    title: "NFT",
    headline: "1/1 or editions",
    body: "Decimals zero. Supply one for a 1/1, or more for editions. Metaplex metadata lives with the mint. No bonding curve.",
  },
  {
    id: "pumpfun",
    title: "PumpSwap pair",
    headline: "SPL mint · PumpSwap AMM",
    body: "Still a real SPL token on OnceUpon. After print, sign and pay PumpSwap create_pool (pAMMBay6…). That is not the Pump.fun program. Use SPL unless you specifically want that pair.",
  },
  {
    id: "pons",
    title: "Pons pair",
    headline: "SPL mint · Pons pool",
    body: "Still a real SPL token. Tagged for Robinhood Chain / Pons. Bind a Pons pool at print; native Pons lives on Robinhood Chain.",
  },
];

export function findChain(id: string | null | undefined): ChainCard | undefined {
  if (!id) return undefined;
  return CHAINS.find((chain) => chain.id === id);
}

export function isPrintableChain(id: string | null | undefined): id is PrintableChain {
  return Boolean(id && (PRINTABLE_CHAIN_IDS as readonly string[]).includes(id));
}

export function isLaunchChain(id: string | null | undefined): id is LaunchChain {
  return Boolean(id && CHAINS.some((chain) => chain.id === id));
}
