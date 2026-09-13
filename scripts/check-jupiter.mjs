const USDC = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const WSOL = "So11111111111111111111111111111111111111112";
const url =
  `https://lite-api.jup.ag/swap/v1/quote?inputMint=${WSOL}&outputMint=${USDC}` +
  `&amount=100000000&slippageBps=50&restrictIntermediateTokens=true`;

const res = await fetch(url);
const body = await res.json();
if (!res.ok || !body.outAmount) {
  console.error(body);
  process.exit(1);
}
const hops = (body.routePlan ?? []).map((step) => step.swapInfo?.label).filter(Boolean);
console.log(
  JSON.stringify(
    {
      ok: true,
      inAmount: body.inAmount,
      outAmount: body.outAmount,
      hops,
    },
    null,
    2,
  ),
);
