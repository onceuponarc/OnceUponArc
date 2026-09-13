import { BASE, ETHEREUM, ROBINHOOD_CHAIN, SOLANA, type LaunchChain } from "./solana";
import { ARC_TESTNET } from "./arc";

export type DexId =
  | "onceupon"
  | "raydium"
  | "orca"
  | "meteora"
  | "pumpswap"
  | "jupiter"
  | "uniswap"
  | "aerodrome"
  | "pons"
  | "curve"
  | "custom";

export type ChainPoolCatalog = {
  id: LaunchChain;
  title: string;
  caip2: string;
  chainId: number | string;
  dexScreener: string;
  explorer: string;
  rpcUrl: string | null;
  factories: { name: string; address: string; dex: DexId }[];
  routers: { name: string; address: string }[];
  quotes: { id: string; symbol: string; address: string; decimals: number }[];
  canonicalPools: CanonicalPool[];
};

export type CanonicalPool = {
  dex: DexId;
  address: string;
  label: string;
  quoteId: string;
  liquidityUsd: number;
  url: string;
};

export const ARC_MAINNET = {
  name: "Arc",
  chainId: 5042,
  caip2: "eip155:5042",
  explorer: "https://explorer.arc.io",
  rpcUrl: "https://rpc.arc.network",
  usdc: "0x3600000000000000000000000000000000000000",
  v2Factory: "0x89e5db8b5aa49aa85ac63f691524311aeb649eba",
  v2Router: "0x1f7d7550b1b028f7571e69a784071f0205fd2efa",
  v3Factory: "0xf0db7b58379503491d857db50ac9ece64c653918",
  swapRouter02: "0x53bf6b0684ec7ef91e1387da3d1a1769bc5a6f77",
  poolManager: "0x8366a39cc670b4001a1121b8f6a443a643e40951",
  positionManager: "0x6049c9a0e26405c0985f9e3685c87d0ae917f82b",
  universalRouter: "0x4fca4a51ab4f23a7447b3284fbd7d73289a89fb1",
} as const;

export const CHAIN_POOLS: Record<LaunchChain, ChainPoolCatalog> = {
  solana: {
    id: "solana",
    title: "Solana",
    caip2: SOLANA.caip2,
    chainId: "solana",
    dexScreener: "solana",
    explorer: SOLANA.explorer,
    rpcUrl: SOLANA.rpcUrl,
    factories: [
      { name: "Raydium AMM", address: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8", dex: "raydium" },
      { name: "Raydium CPMM", address: "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C", dex: "raydium" },
      { name: "Raydium CLMM", address: "CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK", dex: "raydium" },
      { name: "Orca Whirlpool", address: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", dex: "orca" },
      { name: "Meteora DLMM", address: "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo", dex: "meteora" },
      { name: "PumpSwap", address: "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA", dex: "pumpswap" },
    ],
    routers: [{ name: "Jupiter", address: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4" }],
    quotes: [
      { id: "sol", symbol: "SOL", address: SOLANA.wsolMint, decimals: 9 },
      { id: "usdc", symbol: "USDC", address: SOLANA.usdcMint, decimals: 6 },
      { id: "cbbtc", symbol: "cbBTC", address: "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij", decimals: 8 },
      { id: "weth", symbol: "wETH", address: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", decimals: 8 },
      { id: "bonk", symbol: "BONK", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5 },
      { id: "wif", symbol: "WIF", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopJLuG5ZuYxCjs", decimals: 6 },
      { id: "jup", symbol: "JUP", address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", decimals: 6 },
      { id: "aaplx", symbol: "AAPLx", address: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp", decimals: 8 },
      { id: "nvdax", symbol: "NVDAx", address: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh", decimals: 8 },
      { id: "tslax", symbol: "TSLAx", address: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB", decimals: 8 },
      { id: "spyx", symbol: "SPYx", address: "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W", decimals: 8 },
    ],
    canonicalPools: [
      {
        dex: "pumpswap",
        address: "Gf7sXMoP8iRw4iiXmJ1nq4vxcRycbGXy5RL8a8LnTd3v",
        label: "SOL/USDC · PumpSwap",
        quoteId: "sol",
        liquidityUsd: 2_900_000,
        url: "https://dexscreener.com/solana/gf7sxmop8irw4iixmj1nq4vxcrcycbgxy5rl8a8lntd3v",
      },
      {
        dex: "raydium",
        address: "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2",
        label: "SOL/USDC",
        quoteId: "sol",
        liquidityUsd: 31_000_000,
        url: "https://dexscreener.com/solana/58oqchx4ywmvkdwllzzbi4chocc2fqcuwbkwmihlyqo2",
      },
      {
        dex: "orca",
        address: "Czfq3xZZDmsdGdUyrNLtRhGc47cXcZtLG4crryfu44zE",
        label: "SOL/USDC",
        quoteId: "usdc",
        liquidityUsd: 24_000_000,
        url: "https://dexscreener.com/solana/czfq3xzzdmsdgduyrnltrhgc47cxcztlg4crryfu44ze",
      },
      {
        dex: "orca",
        address: "CeaZcxBNLpJWtxzt58qQmfMBtJY8pQLvursXTJYGQpbN",
        label: "cbBTC/SOL",
        quoteId: "cbbtc",
        liquidityUsd: 7_600_000,
        url: "https://dexscreener.com/solana/ceazcxbnlpjwtxzt58qqmfmbtjy8pqlvursxtjygqpbn",
      },
      {
        dex: "orca",
        address: "5zpyutJu9ee6jFymDGoK7F6S5Kczqtc9FomP3ueKuyA9",
        label: "BONK/SOL",
        quoteId: "bonk",
        liquidityUsd: 280_000,
        url: "https://dexscreener.com/solana/5zpyutju9ee6jfymdgok7f6s5kczqtc9fomp3uekuya9",
      },
      {
        dex: "raydium",
        address: "EP2ib6dYdEeqD8MfE2ezHCxX3kP3K2eLKkirfPm5eyMx",
        label: "WIF/SOL",
        quoteId: "wif",
        liquidityUsd: 5_400_000,
        url: "https://dexscreener.com/solana/ep2ib6dydeeqd8mfe2ezhcx3kp3k2elkkirfpm5eymx",
      },
      {
        dex: "raydium",
        address: "CKwJZwm7oj3nu4653N1EpDrqXbXAYXoPFiPeEnLouF8y",
        label: "AAPLx/USDC",
        quoteId: "aaplx",
        liquidityUsd: 335_000,
        url: "https://dexscreener.com/solana/ckwjzwm7oj3nu4653n1epdrqxbxayxopfipeenlouf8y",
      },
      {
        dex: "raydium",
        address: "49iMatQtoyabsYAQc8GafVq6aeBFVDxSRH44oiatyyw6",
        label: "NVDAx/USDC",
        quoteId: "nvdax",
        liquidityUsd: 2_130_000,
        url: "https://dexscreener.com/solana/49imatqtoyabsyaqc8gafvq6aebfvdxsrh44oiatyyw6",
      },
      {
        dex: "raydium",
        address: "8aDaBQkTrS6HVMjyc6EZebgdiaXhLYGriDWKWWp1NpFF",
        label: "TSLAx/USDC",
        quoteId: "tslax",
        liquidityUsd: 2_117_000,
        url: "https://dexscreener.com/solana/8adabqktrs6hvmjyc6ezebgdiaxhlygridwkwwp1npff",
      },
      {
        dex: "raydium",
        address: "6truu3rZuiB9rKQg4VYC3Dt3QwV7DgwGqXrYUcrvnDDE",
        label: "SPYx/USDC",
        quoteId: "spyx",
        liquidityUsd: 2_847_000,
        url: "https://dexscreener.com/solana/6truu3rzuib9rkqg4vyc3dt3qwv7dgwgqxryucrvndde",
      },
      {
        dex: "raydium",
        address: "GMjGLWzvK75LPetrgAmdeXnvxc4fUuQPwJxeQqTDU1aG",
        label: "QQQx/USDC",
        quoteId: "qqqx",
        liquidityUsd: 2_176_000,
        url: "https://dexscreener.com/solana/gmjglwzvk75lpetrgamdexnvxc4fuuqpwjxeqqtdu1ag",
      },
      {
        dex: "raydium",
        address: "CLu4kFM4nb67xrdN7vJnMxXXir8Z5hA4HJUzPFccXjsL",
        label: "MSFTx/USDC",
        quoteId: "msftx",
        liquidityUsd: 317_000,
        url: "https://dexscreener.com/solana/clu4kfm4nb67xrdn7vjnmxxxir8z5ha4hjuzpfccxjsl",
      },
      {
        dex: "raydium",
        address: "B8YAwjGYk6qidWzGBXMAxP7nYfG8g74EZ3Y4gFSsobRw",
        label: "GOOGLx/USDC",
        quoteId: "googlx",
        liquidityUsd: 353_000,
        url: "https://dexscreener.com/solana/b8yawjgyk6qidwzgbxmaxp7nyfg8g74ez3y4gfssobrw",
      },
      {
        dex: "raydium",
        address: "6m5aXAve4uh6Kt4ytKyCLWNMjd8PYP5vujwNCtycrUiD",
        label: "AMZNx/USDC",
        quoteId: "amznx",
        liquidityUsd: 288_000,
        url: "https://dexscreener.com/solana/6m5axave4uh6kt4ytkyclwnmjd8pyp5vujwnctycruid",
      },
      {
        dex: "raydium",
        address: "3L7KbPVaAQA4UTecaGQYsm6UCq5F3sZM9zAYkxqYt63j",
        label: "METAx/USDC",
        quoteId: "metax",
        liquidityUsd: 210_000,
        url: "https://dexscreener.com/solana/3l7kbpvaaqa4utecagqysm6ucq5f3szm9zaykxqyt63j",
      },
      {
        dex: "orca",
        address: "HktfL7iwGKT5QHjywQkcDnZXScoh811k7akrMZJkCcEF",
        label: "wETH/SOL",
        quoteId: "weth",
        liquidityUsd: 6_600_000,
        url: "https://dexscreener.com/solana/hktfl7iwgkt5qhjywqkcdnzxscoh811k7akrmzjkccef",
      },
      {
        dex: "meteora",
        address: "C8Gr6AUuq9hEdSYJzoEpNcdjpojPZwqG5MtQbeouNNwg",
        label: "JUP/SOL",
        quoteId: "jup",
        liquidityUsd: 1_700_000,
        url: "https://dexscreener.com/solana/c8gr6auuq9hedsyjzoepncdjpojpzwqg5mtqbeounnwg",
      },
      {
        dex: "orca",
        address: "FAqh648xeeaTqL7du49sztp9nfj5PjRQrfvaMccyd9cz",
        label: "PENGU/SOL",
        quoteId: "pengu",
        liquidityUsd: 2_600_000,
        url: "https://dexscreener.com/solana/faqh648xeeatql7du49sztp9nfj5pjrqrfvamccyd9cz",
      },
    ],
  },
  ethereum: {
    id: "ethereum",
    title: "Ethereum",
    caip2: ETHEREUM.caip2,
    chainId: 1,
    dexScreener: "ethereum",
    explorer: ETHEREUM.explorer,
    rpcUrl: "https://eth.llamarpc.com",
    factories: [
      { name: "Uniswap V2", address: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", dex: "uniswap" },
      { name: "Uniswap V3", address: "0x1F98431c8aD98523631AE4a59f267346ea31F984", dex: "uniswap" },
    ],
    routers: [
      { name: "Uniswap V2 Router", address: "0x7a250d5630B4cF539739dF2C5dAbB4c659F2488D" },
      { name: "SwapRouter02", address: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45" },
    ],
    quotes: [
      { id: "sol", symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
      { id: "usdc", symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
      { id: "cbbtc", symbol: "WBTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8 },
    ],
    canonicalPools: [
      {
        dex: "uniswap",
        address: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
        label: "WETH/USDC 0.05%",
        quoteId: "usdc",
        liquidityUsd: 300_000_000,
        url: "https://dexscreener.com/ethereum/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
      },
      {
        dex: "uniswap",
        address: "0xCBCdF9626bC03E24f779434178A73a0B4bad62eD",
        label: "WBTC/WETH 0.3%",
        quoteId: "cbbtc",
        liquidityUsd: 42_000_000,
        url: "https://dexscreener.com/ethereum/0xcbcdf9626bc03e24f779434178a73a0b4bad62ed",
      },
    ],
  },
  base: {
    id: "base",
    title: "Base",
    caip2: BASE.caip2,
    chainId: 8453,
    dexScreener: "base",
    explorer: BASE.explorer,
    rpcUrl: "https://mainnet.base.org",
    factories: [
      { name: "Uniswap V3", address: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD", dex: "uniswap" },
      { name: "Aerodrome", address: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da", dex: "aerodrome" },
    ],
    routers: [
      { name: "SwapRouter02", address: "0x2626664c2603336E57B271c5C0b26F421741e481" },
      { name: "Aerodrome Router", address: "0xcF77a3Ba9A5CA399B7c97c74d54e5b1Beb874E43" },
    ],
    quotes: [
      { id: "sol", symbol: "WETH", address: "0x4200000000000000000000000000000000000006", decimals: 18 },
      { id: "usdc", symbol: "USDC", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
      { id: "cbbtc", symbol: "cbBTC", address: "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf", decimals: 8 },
    ],
    canonicalPools: [
      {
        dex: "uniswap",
        address: "0x6c561b446416e1a00e8e93e221854d6ea4171372",
        label: "WETH/USDC 0.3%",
        quoteId: "usdc",
        liquidityUsd: 117_000_000,
        url: "https://dexscreener.com/base/0x6c561b446416e1a00e8e93e221854d6ea4171372",
      },
      {
        dex: "aerodrome",
        address: "0x70aCDF2Ad0bf2402C957154f944c19Ef4e1cbAE1",
        label: "cbBTC/WETH",
        quoteId: "cbbtc",
        liquidityUsd: 15_600_000,
        url: "https://dexscreener.com/base/0x70acdf2ad0bf2402c957154f944c19ef4e1cbae1",
      },
    ],
  },
  arc: {
    id: "arc",
    title: "Arc",
    caip2: ARC_MAINNET.caip2,
    chainId: ARC_MAINNET.chainId,
    dexScreener: "arc",
    explorer: ARC_MAINNET.explorer,
    rpcUrl: ARC_MAINNET.rpcUrl,
    factories: [
      { name: "Uniswap V2", address: ARC_MAINNET.v2Factory, dex: "uniswap" },
      { name: "Uniswap V3", address: ARC_MAINNET.v3Factory, dex: "uniswap" },
      { name: "Uniswap V4 PoolManager", address: ARC_MAINNET.poolManager, dex: "uniswap" },
      {
        name: "Arc Testnet V2",
        address: "0x7483847d46db2920dd64efa676cf72dcf765814f",
        dex: "uniswap",
      },
    ],
    routers: [
      { name: "SwapRouter02", address: ARC_MAINNET.swapRouter02 },
      { name: "Universal Router", address: ARC_MAINNET.universalRouter },
      { name: "Arc Testnet Router02", address: "0xe27d5d256b370604f1ff060fb489c6a8e3f8a6d9" },
    ],
    quotes: [
      { id: "usdc", symbol: "USDC", address: ARC_MAINNET.usdc, decimals: 6 },
      { id: "sol", symbol: "USDC", address: ARC_MAINNET.usdc, decimals: 6 },
      { id: "eurc", symbol: "EURC", address: ARC_TESTNET.eurc, decimals: 6 },
    ],
    canonicalPools: [
      {
        dex: "uniswap",
        address: "0xb3685D16AAa06361ED28377b1319136650Fa9A13",
        label: "USDC/EURC (Arc testnet)",
        quoteId: "usdc",
        liquidityUsd: 0,
        url: `${ARC_TESTNET.explorer}/address/0xb3685D16AAa06361ED28377b1319136650Fa9A13`,
      },
    ],
  },
  robinhood: {
    id: "robinhood",
    title: "Robinhood Chain",
    caip2: ROBINHOOD_CHAIN.caip2,
    chainId: ROBINHOOD_CHAIN.chainId,
    dexScreener: "robinhood",
    explorer: "https://robinhoodchain.blockscout.com",
    rpcUrl: "https://rpc.mainnet.chain.robinhood.com",
    factories: [
      { name: "Pons V2 Launch Factory", address: ROBINHOOD_CHAIN.ponsFactory, dex: "pons" },
      { name: "Uniswap V4 PoolManager", address: "0x8366a39cc670b4001a1121b8f6a443a643e40951", dex: "uniswap" },
    ],
    routers: [{ name: "Pons V2 LaunchAndBuy", address: ROBINHOOD_CHAIN.ponsRouter }],
    quotes: [{ id: "sol", symbol: "ETH", address: "0x0000000000000000000000000000000000000000", decimals: 18 }],
    canonicalPools: [],
  },
};

export function canonicalPoolsForQuote(quoteId: string) {
  const exact = CHAIN_POOLS.solana.canonicalPools.filter((pool) => pool.quoteId === quoteId);
  if (exact.length) return exact;
  if (quoteId === "sol" || quoteId === "usdc") {
    return CHAIN_POOLS.solana.canonicalPools.filter((pool) => pool.quoteId === "sol" || pool.quoteId === "usdc");
  }
  return [];
}

/** Issuers we allow as a quote (xStocks, Ondo, stables). Pairing is a quote, not studio equity. */
export const ALLOWED_QUOTE_ISSUERS = ["Backed", "Ondo", "Circle", "Tether", "PayPal"] as const;

export function createLpLinks(baseMint: string, quoteMint: string | null) {
  const quote = quoteMint && quoteMint.length >= 32 ? quoteMint : SOLANA.usdcMint;
  return [
    {
      id: "raydium" as const,
      name: "Raydium",
      href: "https://raydium.io/liquidity/create-pool/",
      note: "Open a standard AMM. Base = your mint. Quote = NVDAx, USDC, or SOL.",
    },
    {
      id: "meteora" as const,
      name: "Meteora",
      href: "https://app.meteora.ag/pools/create",
      note: "DAMM or DLMM with your mint against the quote.",
    },
    {
      id: "orca" as const,
      name: "Orca",
      href: "https://www.orca.so/create",
      note: "Whirlpool. Paste the two mints.",
    },
    {
      id: "dex" as const,
      name: "Quote depth",
      href: `https://dexscreener.com/solana/${quote}`,
      note: "The live quote pool (for NVDAx that is NVDAx/USDC). Binding this is not the same as putting your mint in it.",
    },
  ];
}

export function isSolUsdcQuote(quoteId: string) {
  return quoteId === "sol" || quoteId === "usdc";
}

export function catalogFor(chain: LaunchChain): ChainPoolCatalog {
  return CHAIN_POOLS[chain];
}

export function catalogByCaip2(caip2: string): ChainPoolCatalog | undefined {
  return (Object.values(CHAIN_POOLS) as ChainPoolCatalog[]).find((item) => item.caip2 === caip2);
}

export function explorerUrlForPool(chainCaip2: string, address: string): string {
  const catalog = catalogByCaip2(chainCaip2);
  if (!catalog) return `https://dexscreener.com/${address}`;
  if (catalog.id === "solana") return `${catalog.explorer}/address/${address}`;
  return `${catalog.explorer}/address/${address}`;
}

export function bindingKindForDex(dex: DexId): "amm_v2" | "amm_v3" | "bonding_curve" | "pond" | "pump_fun" | "jupiter" | "linked_other" {
  if (dex === "onceupon") return "bonding_curve";
  if (dex === "pons") return "pond";
  if (dex === "pumpswap") return "pump_fun";
  if (dex === "uniswap") return "amm_v3";
  if (dex === "aerodrome") return "amm_v2";
  if (dex === "raydium" || dex === "orca" || dex === "meteora" || dex === "jupiter") return "jupiter";
  return "linked_other";
}

export const MAJOR_MINTS = new Set([
  SOLANA.wsolMint,
  SOLANA.usdcMint,
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
  "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij",
  "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase(),
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase(),
  "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599".toLowerCase(),
  "0x4200000000000000000000000000000000000006".toLowerCase(),
  "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913".toLowerCase(),
  "0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf".toLowerCase(),
  ARC_MAINNET.usdc.toLowerCase(),
  "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
  "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
  "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
  "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
]);
