import { SOLANA } from "./solana";
import { CHAPTER } from "./chapter";

export type QuoteGroup = "sol" | "btc" | "stable" | "meme" | "stock" | "etf" | "treasury" | "bond" | "custom";
export type QuoteKind = "sol" | "usdc" | "meme" | "stock" | "etf" | "treasury" | "bond" | "custom";
export type PairClass = "sol" | "usdc" | "rwa_equity" | "rwa_other" | "other";

export type QuoteAsset = {
  id: string;
  symbol: string;
  name: string;
  mint: string | null;
  decimals: number;
  group: QuoteGroup;
  kind: QuoteKind;
  pairClass: PairClass;
  graduationUi: number;
  virtualUi: number;
  issuer: string | null;
  maxBuyUi: number;
};

const XSTOCKS: [id: string, symbol: string, name: string, mint: string][] = [
  ["nvdax", "NVDAx", "NVIDIA xStock", "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh"],
  ["aaplx", "AAPLx", "Apple xStock", "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp"],
  ["tslax", "TSLAx", "Tesla xStock", "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB"],
  ["msftx", "MSFTx", "Microsoft xStock", "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX"],
  ["spyx", "SPYx", "S&P 500 xStock", "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W"],
  ["qqqx", "QQQx", "Nasdaq-100 xStock", "Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ"],
  ["amznx", "AMZNx", "Amazon xStock", "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg"],
  ["googlx", "GOOGLx", "Alphabet xStock", "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN"],
  ["metax", "METAx", "Meta xStock", "Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu"],
  ["nflxx", "NFLXx", "Netflix xStock", "XsEH7wWfJJu2ZT3UCFeVfALnVA6CP5ur7Ee11KmzVpL"],
  ["crclx", "CRCLx", "Circle xStock", "XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1"],
  ["coinx", "COINx", "Coinbase xStock", "Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu"],
  ["mstrx", "MSTRx", "MicroStrategy xStock", "XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ"],
  ["hoodx", "HOODx", "Robinhood xStock", "XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg"],
  ["pltrx", "PLTRx", "Palantir xStock", "XsoBhf2ufR8fTyNSjqfU71DYGaE6Z3SUGAidpzriAA4"],
  ["avgo", "AVGOx", "Broadcom xStock", "XsgSaSvNSqLTtFuyWPBhK9196Xb9Bbdyjj4fH3cPJGo"],
  ["llyx", "LLYx", "Eli Lilly xStock", "Xsnuv4omNoHozR6EEW5mXkw8Nrny5rB3jVfLqi6gKMH"],
  ["jpmx", "JPMx", "JPMorgan xStock", "XsMAqkcKsUewDrzVkait4e5u4y8REgtyS7jWgCpLV2C"],
  ["v", "Vx", "Visa xStock", "XsqgsbXwWogGJsNcVZ3TyVouy2MbTkfCFhCGGGcQZ2p"],
  ["goldx", "GLDx", "Gold xStock", "Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re"],
  ["crwdx", "CRWDx", "CrowdStrike xStock", "Xs7xXqkcK7K8urEqGg52SECi79dRp2cEKKuYjUePYDw"],
  ["mcdx", "MCDx", "McDonald’s xStock", "XsqE9cRRpzxcGKDXj1BJ7Xmg4GRhZoyY1KpmGSxAWT2"],
  ["vtix", "VTIx", "Vanguard Total xStock", "XsssYEQjzxBCFgvYFFNuhJFBeHNdLWYeUSP8F45cDr9"],
  ["orclx", "ORCLx", "Oracle xStock", "XsjFwUPiLofddX5cWFHW35GCbXcSu1BCUGfxoQAQjeL"],
  ["wmtx", "WMTx", "Walmart xStock", "Xs151QeqTCiuKtinzfRATnUESM2xTU6V9Wy8Vy538ci"],
  ["mdtx", "MDTx", "Medtronic xStock", "XsDgw22qRLTv5Uwuzn6T63cW69exG41T6gwQhEK22u2"],
  ["mrvlx", "MRVLx", "Marvell xStock", "XsuxRGDzbLjnJ72v74b7p9VY6N66uYgTCyfwwRjVCJA"],
  ["aznx", "AZNx", "AstraZeneca xStock", "Xs3ZFkPYT2BN7qBMqf1j1bfTeTm1rFzEFSsQ1z3wAKU"],
  ["honx", "HONx", "Honeywell xStock", "XsRbLZthfABAPAfumWNEJhPyiKDW6TvDVeAeW7oKqA2"],
  ["acnx", "ACNx", "Accenture xStock", "Xs5UJzmCRQ8DWZjskExdSQDnbE6iLkRu2jjrRAB1JSU"],
  ["hdx", "HDx", "Home Depot xStock", "XszjVtyhowGjSC5odCqBpW1CtXXwXjYokymrk7fGKD3"],
  ["gmex", "GMEx", "GameStop xStock", "Xsf9mBktVB9BSU5kf4nHxPq5hCBJ2j2ui3ecFGxPRGc"],
  ["intcx", "INTCx", "Intel xStock", "XshPgPdXFRWB8tP1j82rebb2Q9rPgGX37RuqzohmArM"],
  ["dfdvx", "DFDVx", "DeFi Development xStock", "Xs2yquAgsHByNzx68WJC55WHjHBvG9JsMB7CWjTLyPy"],
  ["brkbx", "BRK.Bx", "Berkshire B xStock", "Xs6B6zawENwAbWVi7w92rjazLuAr5Az59qgWKcNb45x"],
  ["bacx", "BACx", "Bank of America xStock", "XswsQk4duEQmCbGzfqUUWYmi7pV7xpJ9eEmLHXCaEQP"],
  ["cvxx", "CVXx", "Chevron xStock", "XsNNMt7WTNA2sV3jrb1NNfNgapxRF5i4i6GcnTRRHts"],
  ["cscox", "CSCOx", "Costco xStock", "Xsr3pdLQyXvDJBFgpR5nexCEZwXvigb8wbPYp4YoNFf"],
  ["pgx", "PGx", "Procter & Gamble xStock", "XsYdjDjNUygZ7yGKfQaB6TxLh2gC6RRjzLtLAGJrhzV"],
  ["cmcsax", "CMCSAx", "Comcast xStock", "XsvKCaNsxg2GN8jjUmq71qukMJr7Q1c5R2Mk9P8kcS8"],
  ["linx", "LINx", "Linde xStock", "XsSr8anD1hkvNMu8XQiVcmiaTP7XGvYu7Q58LdmtE8Z"],
  ["unhx", "UNHx", "UnitedHealth xStock", "XszvaiXGPwvk2nwb3o9C1CX4K6zH8sez11E6uyup6fe"],
  ["pepx", "PEPx", "PepsiCo xStock", "Xsv99frTRUeornyvCfvhnDesQDWuvns1M852Pez91vF"],
  ["ambrx", "AMBRx", "Amber xStock", "XsaQTCgebC2KPbf27KUhdv5JFvHhQ4GDAPURwrEhAzb"],
  ["max", "MAx", "Mastercard xStock", "XsApJFV9MAktqnAc6jqzsHVujxkGm9xcSUffaBoYLKC"],
  ["nvox", "NVOx", "Novo Nordisk xStock", "XsfAzPzYrYjd4Dpa9BU3cusBsvWfVB9gBcyGC87S57n"],
  ["pmx", "PMx", "Philip Morris xStock", "Xsba6tUnSjDae2VcopDB6FGGDaxRrewFCDa5hKn5vT3"],
  ["xomx", "XOMx", "Exxon Mobil xStock", "XsaHND8sHyfMfsWPj6kSdd5VwvCayZvjYgKmmcNL5qh"],
  ["pfex", "PFEx", "Pfizer xStock", "XsAtbqkAP1HJxy7hFDeq7ok6yM43DQ9mQ1Rh861X8rw"],
  ["dhrx", "DHRx", "Danaher xStock", "Xseo8tgCZfkHxWS9xbFYeKFyMSbWEvZGFV1Gh53GtCV"],
  ["gsx", "GSx", "Goldman Sachs xStock", "XsgaUyp4jd1fNBCxgtTKkW64xnnhQcvgaxzsbAq5ZD1"],
  ["tmox", "TMOx", "Thermo Fisher xStock", "Xs8drBWy3Sd5QY3aifG9kt9KFs2K3PGZmx7jWrsrk57"],
  ["mrkx", "MRKx", "Merck xStock", "XsnQnU7AdbRZYe2akqqpibDdXjkieGFfSkbkjX1Sd1X"],
  ["abtx", "ABTx", "Abbott xStock", "XsHtf5RpxsQ7jeJ9ivNewouZKJHbPxhPoEy6yYvULr7"],
  ["crmx", "CRMx", "Salesforce xStock", "XsczbcQ3zfcgAEt9qHQES8pxKAVG5rujPSHQEXi4kaN"],
  ["tqqqx", "TQQQx", "T-QQQ xStock", "XsjQP3iMAaQ3kQScQKthQpx9ALRbjKAjQtHg6TFomoc"],
  ["jnjx", "JNJx", "Johnson & Johnson xStock", "XsGVi5eo1Dh2zUpic4qACcjuWGjNv8GCt3dm5XcX6Dn"],
  ["abbvx", "ABBVx", "AbbVie xStock", "XswbinNKyPmzTa5CskMbCPvMW6G5CMnZXZEeQSSQoie"],
  ["appx", "APPx", "AppLovin xStock", "XsPdAVBi8Zc1xvv53k4JcMrQaEDTgkGqKYeh7AYgPHV"],
  ["ibm", "IBMx", "IBM xStock", "XspwhyYPdWVM8XBHZnpS9hgyag9MKjLRyE3tVfmCbSr"],
  ["kox", "KOx", "Coca-Cola xStock", "XsaBXg8dU5cPM6ehmVctMkVqoiRG2ZjMo1cyBJ3AykQ"],
];

export const QUOTE_ASSETS: QuoteAsset[] = [
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    mint: null,
    decimals: 9,
    group: "sol",
    kind: "sol",
    pairClass: "sol",
    graduationUi: SOLANA.bondingGraduationSol,
    virtualUi: SOLANA.virtualQuoteSol,
    issuer: null,
    maxBuyUi: 50,
  },
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    mint: SOLANA.usdcMint,
    decimals: 6,
    group: "stable",
    kind: "usdc",
    pairClass: "usdc",
    graduationUi: CHAPTER.graduateQuoteUi,
    virtualUi: CHAPTER.startCapQuoteUi,
    issuer: "Circle",
    maxBuyUi: 100_000,
  },
  {
    id: "usdt",
    symbol: "USDT",
    name: "Tether USD",
    mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
    group: "stable",
    kind: "usdc",
    pairClass: "usdc",
    graduationUi: CHAPTER.graduateQuoteUi,
    virtualUi: CHAPTER.startCapQuoteUi,
    issuer: "Tether",
    maxBuyUi: 100_000,
  },
  {
    id: "pyusd",
    symbol: "PYUSD",
    name: "PayPal USD",
    mint: "2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo",
    decimals: 6,
    group: "stable",
    kind: "usdc",
    pairClass: "usdc",
    graduationUi: CHAPTER.graduateQuoteUi,
    virtualUi: CHAPTER.startCapQuoteUi,
    issuer: "PayPal",
    maxBuyUi: 100_000,
  },
  {
    id: "cbbtc",
    symbol: "cbBTC",
    name: "Bitcoin (cbBTC)",
    mint: "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij",
    decimals: 8,
    group: "btc",
    kind: "custom",
    pairClass: "other",
    graduationUi: 0.1,
    virtualUi: 1.5,
    issuer: "Coinbase",
    maxBuyUi: 5,
  },
  {
    id: "weth",
    symbol: "wETH",
    name: "Ether (Portal)",
    mint: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    decimals: 8,
    group: "btc",
    kind: "custom",
    pairClass: "other",
    graduationUi: 2,
    virtualUi: 30,
    issuer: "Portal",
    maxBuyUi: 50,
  },
  {
    id: "bonk",
    symbol: "BONK",
    name: "Bonk",
    mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    decimals: 5,
    group: "meme",
    kind: "meme",
    pairClass: "other",
    graduationUi: 50_000_000,
    virtualUi: 750_000_000,
    issuer: null,
    maxBuyUi: 500_000_000,
  },
  {
    id: "wif",
    symbol: "WIF",
    name: "dogwifhat",
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopJLuG5ZuYxCjs",
    decimals: 6,
    group: "meme",
    kind: "meme",
    pairClass: "other",
    graduationUi: 20_000,
    virtualUi: 300_000,
    issuer: null,
    maxBuyUi: 200_000,
  },
  {
    id: "jup",
    symbol: "JUP",
    name: "Jupiter",
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    decimals: 6,
    group: "meme",
    kind: "meme",
    pairClass: "other",
    graduationUi: 25_000,
    virtualUi: 375_000,
    issuer: null,
    maxBuyUi: 250_000,
  },
  {
    id: "pengu",
    symbol: "PENGU",
    name: "Pudgy Penguins",
    mint: "2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv",
    decimals: 6,
    group: "meme",
    kind: "meme",
    pairClass: "other",
    graduationUi: 200_000,
    virtualUi: 3_000_000,
    issuer: null,
    maxBuyUi: 2_000_000,
  },
  {
    id: "usdy",
    symbol: "USDY",
    name: "Ondo US Dollar Yield",
    mint: "A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6",
    decimals: 6,
    group: "treasury",
    kind: "treasury",
    pairClass: "rwa_other",
    graduationUi: CHAPTER.graduateQuoteUi,
    virtualUi: CHAPTER.startCapQuoteUi,
    issuer: "Ondo",
    maxBuyUi: 100_000,
  },
  {
    id: "ousg",
    symbol: "OUSG",
    name: "Ondo Short-Term US Government Treasuries",
    mint: "i7u4r16TcsJTgq1kAG8opmVZyVnAKBwLKu6ZPMwzxNc",
    decimals: 6,
    group: "bond",
    kind: "bond",
    pairClass: "rwa_other",
    graduationUi: 50,
    virtualUi: 300,
    issuer: "Ondo",
    maxBuyUi: 10_000,
  },
  ...XSTOCKS.map(([id, symbol, name, mint]) => {
    const etf = id === "spyx" || id === "qqqx" || id === "tqqqx" || id === "vtix" || id === "gldx";
    return {
      id,
      symbol,
      name,
      mint,
      decimals: 8,
      group: (etf ? "etf" : "stock") as QuoteAsset["group"],
      kind: (etf ? "etf" : "stock") as QuoteAsset["kind"],
      pairClass: "rwa_equity" as const,
      graduationUi: 10,
      virtualUi: 100,
      issuer: "Backed",
      maxBuyUi: 1_000,
    };
  }),
];

export const QUOTE_GROUPS: { id: QuoteGroup; label: string; hint: string }[] = [
  { id: "sol", label: "SOL", hint: "Native Solana. Deepest default pair." },
  { id: "btc", label: "BTC / ETH", hint: "Pair into Bitcoin and Ether liquidity already on Solana. No new pool to fund." },
  { id: "stable", label: "Stables", hint: "USDC, USDT, PYUSD." },
  { id: "meme", label: "Memes", hint: "Pair into BONK, WIF, JUP, PENGU and other live mints." },
  { id: "stock", label: "Stocks", hint: "Listed xStocks such as NVDAx. Quote pair, not studio equity — the live deep pool is hop-1 routing, never this Story’s market." },
  { id: "etf", label: "ETFs", hint: "Listed index xStocks such as SPYx and QQQx. Quote pair only — not a claim on the fund." },
  { id: "treasury", label: "Treasuries", hint: "Ondo USDY. Quote pair only — not a claim on the issuer." },
  { id: "bond", label: "Bonds", hint: "Ondo OUSG short-term government bonds. Quote pair only." },
  { id: "custom", label: "Any pool", hint: "Paste any SPL mint or pick Any mint, then link any live pool address." },
];

export function findQuote(id: string): QuoteAsset | undefined {
  return QUOTE_ASSETS.find((item) => item.id === id);
}

export function findQuoteByMint(mint: string | null | undefined): QuoteAsset | undefined {
  if (!mint) return QUOTE_ASSETS.find((item) => item.id === "sol");
  return QUOTE_ASSETS.find((item) => item.mint === mint);
}

export function uiToRaw(ui: number, decimals: number): bigint {
  if (!Number.isFinite(ui) || ui < 0) return 0n;
  const factor = 10 ** decimals;
  return BigInt(Math.round(ui * factor));
}

export function rawToUi(raw: bigint, decimals: number): number {
  return Number(raw) / 10 ** decimals;
}

export function graduationRaw(asset: Pick<QuoteAsset, "graduationUi" | "decimals">): bigint {
  return uiToRaw(asset.graduationUi, asset.decimals);
}

export function virtualRaw(asset: Pick<QuoteAsset, "virtualUi" | "decimals">): bigint {
  return uiToRaw(asset.virtualUi, asset.decimals);
}

export function customQuoteAsset(mint: string, decimals: number, symbol = "TOKEN"): QuoteAsset {
  const graduationUi = decimals === 9 ? 2 : decimals === 6 ? CHAPTER.graduateQuoteUi : decimals === 8 ? 10 : 1_000;
  const virtualUi = decimals === 6 ? CHAPTER.startCapQuoteUi : graduationUi;
  return {
    id: "custom",
    symbol,
    name: "Custom mint",
    mint,
    decimals,
    group: "custom",
    kind: "custom",
    pairClass: "other",
    graduationUi,
    virtualUi,
    issuer: null,
    maxBuyUi: decimals === 8 ? 1_000 : 100_000,
  };
}
