import { JUPITER, SOLANA, type LaunchChain } from "@onceupon/config/solana";
import {
  CHAIN_POOLS,
  MAJOR_MINTS,
  bindingKindForDex,
  type CanonicalPool,
  type DexId,
} from "@onceupon/config/pools";
import { findQuote } from "@onceupon/config/quotes";

export type ResolvedPool = {
  id: string;
  dex: DexId;
  address: string;
  label: string;
  liquidityUsd: number;
  url: string;
  chain: LaunchChain;
  chainCaip2: string;
  quoteAddress: string | null;
  source: "dexscreener" | "canonical" | "jupiter" | "custom";
};

export type PoolResolveResult = {
  chain: LaunchChain;
  quoteId: string;
  quoteMint: string | null;
  quoteSymbol: string;
  launchPool: {
    dex: "onceupon";
    label: string;
    note: string;
  };
  linked: ResolvedPool[];
  destination: ResolvedPool[];
  factories: { name: string; address: string; dex: DexId }[];
};

const DEX_SCREENER = "https://api.dexscreener.com";

function timeoutSignal(ms: number) {
  return AbortSignal.timeout(ms);
}

function norm(address: string) {
  return address.trim();
}

function isEvm(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function isSolanaAddr(address: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

function isPoolAddress(address: string) {
  return isEvm(address) || isSolanaAddr(address);
}

function otherIsMajor(base?: string, quote?: string, focus?: string | null) {
  const b = (base ?? "").toLowerCase();
  const q = (quote ?? "").toLowerCase();
  const f = (focus ?? "").toLowerCase();
  const other = b === f ? q : q === f ? b : q;
  if (!other) return false;
  return [...MAJOR_MINTS].some((m) => m.toLowerCase() === other);
}

function canonicalAsResolved(chain: LaunchChain, pool: CanonicalPool, quoteAddress: string | null): ResolvedPool {
  const catalog = CHAIN_POOLS[chain];
  return {
    id: `${chain}:${pool.address}`,
    dex: pool.dex,
    address: pool.address,
    label: pool.label,
    liquidityUsd: pool.liquidityUsd,
    url: pool.url,
    chain,
    chainCaip2: catalog.caip2,
    quoteAddress,
    source: "canonical",
  };
}

type DexPair = {
  dexId?: string;
  pairAddress?: string;
  url?: string;
  liquidity?: { usd?: number };
  baseToken?: { address?: string; symbol?: string };
  quoteToken?: { address?: string; symbol?: string };
  chainId?: string;
};

async function fetchDexPairs(slug: string, token: string): Promise<DexPair[]> {
  const urls = [
    `${DEX_SCREENER}/token-pairs/v1/${slug}/${token}`,
    `${DEX_SCREENER}/latest/dex/tokens/${token}`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        signal: timeoutSignal(5000),
        cache: "no-store",
        headers: { accept: "application/json", "user-agent": "OnceUpon/1.0" },
      });
      if (!res.ok) continue;
      const body = (await res.json()) as DexPair[] | { pairs?: DexPair[] };
      const list = Array.isArray(body) ? body : (body.pairs ?? []);
      if (list.length) return list;
    } catch {
      // next source
    }
  }
  return [];
}

const KNOWN_DEX: DexId[] = [
  "raydium",
  "orca",
  "meteora",
  "pumpswap",
  "uniswap",
  "aerodrome",
  "jupiter",
  "curve",
  "pons",
];

function fromDexPairs(
  chain: LaunchChain,
  pairs: DexPair[],
  focusMint: string | null,
): ResolvedPool[] {
  const catalog = CHAIN_POOLS[chain];
  const focus = focusMint?.toLowerCase() ?? null;
  const ranked = pairs
    .filter((pair) => pair.pairAddress && isPoolAddress(pair.pairAddress))
    .map((pair) => {
      const base = pair.baseToken?.address ?? "";
      const quote = pair.quoteToken?.address ?? "";
      const involved = !focus || base.toLowerCase() === focus || quote.toLowerCase() === focus;
      const liq = Number(pair.liquidity?.usd ?? 0);
      const dex = (pair.dexId ?? "custom") as DexId;
      const pool: ResolvedPool & { involved: boolean; major: boolean } = {
        id: `${chain}:${pair.pairAddress}`,
        dex: KNOWN_DEX.includes(dex) ? dex : "custom",
        address: pair.pairAddress as string,
        label: `${pair.baseToken?.symbol ?? "TOKEN"}/${pair.quoteToken?.symbol ?? "QUOTE"}`,
        liquidityUsd: Number.isFinite(liq) ? liq : 0,
        url: pair.url ?? `https://dexscreener.com/${catalog.dexScreener}/${(pair.pairAddress ?? "").toLowerCase()}`,
        chain,
        chainCaip2: catalog.caip2,
        quoteAddress: quote || null,
        source: "dexscreener",
        involved,
        major: otherIsMajor(base, quote, focusMint),
      };
      return pool;
    })
    .filter((pair) => pair.involved)
    .sort((a, b) => {
      if (a.major !== b.major) return a.major ? -1 : 1;
      return b.liquidityUsd - a.liquidityUsd;
    })
    .slice(0, 8);
  return ranked.map(({ involved: _involved, major: _major, ...pool }) => pool);
}

async function jupiterHopPools(quoteMint: string): Promise<ResolvedPool[]> {
  try {
    const search = new URLSearchParams({
      inputMint: SOLANA.wsolMint,
      outputMint: quoteMint,
      amount: "100000000",
      slippageBps: "50",
      restrictIntermediateTokens: "true",
    });
    const res = await fetch(`${JUPITER.quoteUrl}?${search.toString()}`, {
      signal: timeoutSignal(5000),
      cache: "no-store",
    });
    if (!res.ok) return [];
    const body = (await res.json()) as {
      routePlan?: { swapInfo?: { label?: string; ammKey?: string } }[];
    };
    const hops = body.routePlan ?? [];
    const pools: ResolvedPool[] = [];
    for (const hop of hops) {
      const address = hop.swapInfo?.ammKey;
      const label = hop.swapInfo?.label ?? "pool";
      if (!address || !isPoolAddress(address)) continue;
      const lower = label.toLowerCase();
      pools.push({
        id: `solana:${address}`,
        dex: lower.includes("orca")
          ? "orca"
          : lower.includes("raydium")
            ? "raydium"
            : lower.includes("meteora")
              ? "meteora"
              : "jupiter",
        address,
        label: `${label} · SOL route`,
        liquidityUsd: 0,
        url: `https://solscan.io/account/${address}`,
        chain: "solana",
        chainCaip2: SOLANA.caip2,
        quoteAddress: quoteMint,
        source: "jupiter",
      });
    }
    return pools;
  } catch {
    return [];
  }
}

function mergePools(list: ResolvedPool[]) {
  const seen = new Set<string>();
  const out: ResolvedPool[] = [];
  for (const item of list) {
    const key = `${item.chainCaip2}:${item.address.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out.sort((a, b) => b.liquidityUsd - a.liquidityUsd);
}

export async function resolvePools(input: {
  chain: LaunchChain;
  quoteId?: string;
  quoteMint?: string | null;
  preferDex?: DexId | null;
}): Promise<PoolResolveResult> {
  const chain = input.chain;
  const listed = input.quoteId ? findQuote(input.quoteId) : undefined;
  const quoteMint = input.quoteMint || listed?.mint || (listed?.id === "sol" ? SOLANA.wsolMint : null);
  const quoteId = listed?.id ?? input.quoteId ?? "custom";
  const quoteSymbol = listed?.symbol ?? "TOKEN";
  const solanaMint = quoteMint && isSolanaAddr(quoteMint) ? quoteMint : listed?.id === "sol" ? SOLANA.wsolMint : quoteMint;

  const solanaPairs = solanaMint ? await fetchDexPairs("solana", solanaMint) : [];
  let linked = fromDexPairs("solana", solanaPairs, solanaMint);
  if (solanaMint && solanaMint !== SOLANA.wsolMint) {
    const hops = await jupiterHopPools(solanaMint);
    linked = mergePools([...linked, ...hops]);
  }
  const canonical = CHAIN_POOLS.solana.canonicalPools.filter(
    (pool) => pool.quoteId === quoteId || pool.quoteId === listed?.id,
  );
  linked = mergePools([
    ...linked,
    ...canonical.map((pool) => canonicalAsResolved("solana", pool, solanaMint)),
  ]);
  if (input.preferDex === "pumpswap") {
    const pumpCanonical = CHAIN_POOLS.solana.canonicalPools.filter((pool) => pool.dex === "pumpswap");
    linked = mergePools([
      ...pumpCanonical.map((pool) => canonicalAsResolved("solana", pool, solanaMint)),
      ...linked,
    ]);
  }
  if (!linked.length) {
    linked = CHAIN_POOLS.solana.canonicalPools
      .filter((pool) => pool.quoteId === "sol" || pool.quoteId === "usdc")
      .map((pool) => canonicalAsResolved("solana", pool, SOLANA.wsolMint));
  }
  if (input.preferDex) {
    const prefer = input.preferDex;
    linked = [...linked].sort((a, b) => {
      const ap = a.dex === prefer ? 1 : 0;
      const bp = b.dex === prefer ? 1 : 0;
      if (ap !== bp) return bp - ap;
      return b.liquidityUsd - a.liquidityUsd;
    });
  }

  let destination: ResolvedPool[] = [];
  if (chain !== "solana") {
    const catalog = CHAIN_POOLS[chain];
    const mapped = catalog.quotes.find((item) => item.id === quoteId) ?? catalog.quotes[0];
    if (mapped && isEvm(mapped.address)) {
      const pairs = await fetchDexPairs(catalog.dexScreener, mapped.address);
      destination = fromDexPairs(chain, pairs, mapped.address);
    }
    const matching = catalog.canonicalPools.filter(
      (pool) => pool.quoteId === quoteId || pool.quoteId === mapped?.id,
    );
    destination = mergePools([
      ...destination,
      ...(matching.length ? matching : catalog.canonicalPools).map((pool) =>
        canonicalAsResolved(chain, pool, mapped?.address ?? null),
      ),
    ]);
  }

  return {
    chain,
    quoteId,
    quoteMint: solanaMint,
    quoteSymbol,
    launchPool: {
      dex: "onceupon",
      label: `OnceUpon launch pool · ${quoteSymbol}`,
      note:
        input.preferDex === "pumpswap"
          ? "The mint prints on OnceUpon. The curve is live from block one. Pump.fun venue pairs a PumpSwap pool (pAMMBay6…) as the linked AMM — that is the pool this launch is paired with."
          : "The mint prints on Solana. The curve is the live pool against this quote from block one. You do not seed an empty AMM.",
    },
    linked: linked.slice(0, 8),
    destination: destination.slice(0, 8),
    factories: CHAIN_POOLS[chain].factories,
  };
}

export function parseLinkedPool(body: {
  poolAddress?: string;
  poolDex?: string;
  poolLabel?: string;
  poolUrl?: string;
  poolChain?: string;
  poolDepthUsd?: number;
  quoteAddress?: string | null;
}): ResolvedPool | null {
  if (!body.poolAddress || !isPoolAddress(body.poolAddress)) return null;
  const chain = (body.poolChain as LaunchChain) || "solana";
  const catalog = CHAIN_POOLS[chain] ?? CHAIN_POOLS.solana;
  const dex = (body.poolDex as DexId) || "custom";
  return {
    id: `${chain}:${body.poolAddress}`,
    dex,
    address: norm(body.poolAddress),
    label: body.poolLabel || "Linked pool",
    liquidityUsd: Number(body.poolDepthUsd ?? 0),
    url: body.poolUrl || "",
    chain: catalog.id,
    chainCaip2: catalog.caip2,
    quoteAddress: body.quoteAddress ?? null,
    source: "custom",
  };
}

export { bindingKindForDex };
