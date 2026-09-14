const UA = { accept: "application/json", "user-agent": "OrbitX/1.0" };

const FACTORIES = {
  raydiumAmm: "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8",
  raydiumCpmm: "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C",
  orca: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc",
  meteora: "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo",
  uniV2: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  uniV3: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
  aerodrome: "0x420DD381b31aEf6683db6B902084cB0FFECe40Da",
  pons: "0x7ed598bcef8bd9edd8c97a195c6d13f40801ec7e",
  arcV2: "0x89e5db8b5aa49aa85ac63f691524311aeb649eba",
  pumpswap: "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA",
};

const MINTS = {
  sol: "So11111111111111111111111111111111111111112",
  usdc: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  cbbtc: "cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij",
  bonk: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  wethBase: "0x4200000000000000000000000000000000000006",
  nvdax: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
};

const CANONICAL = {
  solUsdcRaydium: "58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2",
  solUsdcPumpswap: "Gf7sXMoP8iRw4iiXmJ1nq4vxcRycbGXy5RL8a8LnTd3v",
  nvdaxUsdcRaydium: "49iMatQtoyabsYAQc8GafVq6aeBFVDxSRH44oiatyyw6",
  ethWethUsdc: "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640",
};

async function dexPairs(chain, mint) {
  const urls = [
    `https://api.dexscreener.com/token-pairs/v1/${chain}/${mint}`,
    `https://api.dexscreener.com/latest/dex/tokens/${mint}`,
  ];
  for (const url of urls) {
    const res = await fetch(url, { headers: UA });
    if (!res.ok) continue;
    const body = await res.json();
    const list = Array.isArray(body) ? body : body.pairs ?? [];
    if (list.length) return list;
  }
  return [];
}

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

async function main() {
  const { readFileSync } = await import("node:fs");
  const src =
    readFileSync(new URL("../packages/config/src/pools.ts", import.meta.url), "utf8") +
    readFileSync(new URL("../packages/config/src/solana.ts", import.meta.url), "utf8");
  for (const [name, address] of Object.entries(FACTORIES)) {
    assert(src.includes(address), `catalog missing ${name} ${address}`);
  }

  const sol = await dexPairs("solana", MINTS.sol);
  const usdc = await dexPairs("solana", MINTS.usdc);
  const cbbtc = await dexPairs("solana", MINTS.cbbtc);
  const bonk = await dexPairs("solana", MINTS.bonk);
  const nvdax = await dexPairs("solana", MINTS.nvdax);
  const eth = await dexPairs("ethereum", MINTS.weth);
  const base = await dexPairs("base", MINTS.wethBase);

  assert(sol.length > 0, "no Solana SOL pairs");
  assert(usdc.length > 0, "no Solana USDC pairs");
  assert(cbbtc.length > 0, "no Solana cbBTC pairs");
  assert(bonk.length > 0, "no Solana BONK pairs");
  assert(nvdax.length > 0, "no Solana NVDAx pairs");
  assert(eth.length > 0, "no Ethereum WETH pairs");
  assert(base.length > 0, "no Base WETH pairs");

  const solAddrs = new Set(sol.map((p) => p.pairAddress));
  assert(solAddrs.has(CANONICAL.solUsdcRaydium), "canonical SOL/USDC Raydium pool missing from DexScreener");
  assert(src.includes(CANONICAL.solUsdcPumpswap), "catalog missing PumpSwap SOL/USDC pool");
  assert(src.includes(CANONICAL.nvdaxUsdcRaydium), "catalog missing NVDAx/USDC Raydium pool");
  const nvdaxAddrs = new Set(nvdax.map((p) => p.pairAddress));
  assert(nvdaxAddrs.has(CANONICAL.nvdaxUsdcRaydium), "canonical NVDAx/USDC Raydium pool missing from DexScreener");

  const ethAddrs = new Set(eth.map((p) => (p.pairAddress ?? "").toLowerCase()));
  assert(ethAddrs.has(CANONICAL.ethWethUsdc.toLowerCase()), "canonical WETH/USDC Uniswap pool missing");

  const jup = await fetch(
    "https://lite-api.jup.ag/swap/v1/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&slippageBps=50",
    { headers: UA },
  );
  const quote = await jup.json();
  assert(jup.ok && quote.outAmount, "Jupiter SOL/USDC quote failed");

  console.log(
    JSON.stringify(
      {
        ok: true,
        solana: { sol: sol.length, usdc: usdc.length, cbbtc: cbbtc.length, bonk: bonk.length, nvdax: nvdax.length },
        ethereum: eth.length,
        base: base.length,
        factories: Object.keys(FACTORIES),
        jupiterOut: quote.outAmount,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
