import { JUPITER, SOLANA } from "@onceupon/config/solana";

export type JupiterHop = {
  label: string;
  percent: number;
  inAmount: string;
  outAmount: string;
  inputMint: string;
  outputMint: string;
};

export type JupiterQuote = {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  slippageBps: number;
  priceImpactPct: string;
  routePlan: { percent?: number; swapInfo?: Record<string, unknown> }[];
  hops: JupiterHop[];
};

export function jupiterBase() {
  return {
    quote: process.env.JUPITER_QUOTE_URL ?? JUPITER.quoteUrl,
    swap: process.env.JUPITER_SWAP_URL ?? JUPITER.swapUrl,
  };
}

export function mintForSymbol(symbol: string): { mint: string; decimals: number; symbol: string } | null {
  const key = symbol.trim().toUpperCase();
  if (key === "SOL") return { mint: SOLANA.wsolMint, decimals: 9, symbol: "SOL" };
  if (key === "USDC") return { mint: SOLANA.usdcMint, decimals: 6, symbol: "USDC" };
  return null;
}

export function parseJupiterQuote(body: Record<string, unknown>): JupiterQuote {
  if (!body || typeof body.error === "string") {
    throw new Error(typeof body?.error === "string" ? body.error : "Jupiter returned no route.");
  }
  const inputMint = String(body.inputMint ?? "");
  const outputMint = String(body.outputMint ?? "");
  const inAmount = String(body.inAmount ?? "");
  const outAmount = String(body.outAmount ?? "");
  if (!inputMint || !outputMint || !inAmount || !outAmount) {
    throw new Error("Jupiter quote was incomplete.");
  }
  const routePlan = Array.isArray(body.routePlan)
    ? (body.routePlan as { percent?: number; swapInfo?: Record<string, unknown> }[])
    : [];
  const hops: JupiterHop[] = routePlan.map((step) => {
    const info = step.swapInfo ?? {};
    return {
      label: String(info.label ?? "pool"),
      percent: Number(step.percent ?? 100),
      inAmount: String(info.inAmount ?? ""),
      outAmount: String(info.outAmount ?? ""),
      inputMint: String(info.inputMint ?? ""),
      outputMint: String(info.outputMint ?? ""),
    };
  });
  return {
    inputMint,
    inAmount,
    outputMint,
    outAmount,
    otherAmountThreshold: String(body.otherAmountThreshold ?? outAmount),
    slippageBps: Number(body.slippageBps ?? 50),
    priceImpactPct: String(body.priceImpactPct ?? "0"),
    routePlan,
    hops,
  };
}

export async function fetchJupiterQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps?: number;
}): Promise<{ quote: JupiterQuote; raw: Record<string, unknown> }> {
  const { quote: quoteUrl } = jupiterBase();
  const search = new URLSearchParams({
    inputMint: params.inputMint,
    outputMint: params.outputMint,
    amount: params.amount,
    slippageBps: String(params.slippageBps ?? 50),
    restrictIntermediateTokens: "true",
  });
  const res = await fetch(`${quoteUrl}?${search.toString()}`, { cache: "no-store" });
  const raw = (await res.json()) as Record<string, unknown>;
  if (!res.ok) {
    throw new Error(typeof raw.error === "string" ? raw.error : `Jupiter quote failed (${res.status}).`);
  }
  return { quote: parseJupiterQuote(raw), raw };
}

export async function fetchJupiterSwap(params: {
  userPublicKey: string;
  quoteResponse: Record<string, unknown>;
}): Promise<{ swapTransaction: string }> {
  const { swap } = jupiterBase();
  const res = await fetch(swap, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userPublicKey: params.userPublicKey,
      quoteResponse: params.quoteResponse,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto",
    }),
    cache: "no-store",
  });
  const body = (await res.json()) as { swapTransaction?: string; error?: string };
  if (!res.ok || !body.swapTransaction) {
    throw new Error(body.error ?? `Jupiter swap build failed (${res.status}).`);
  }
  return { swapTransaction: body.swapTransaction };
}
