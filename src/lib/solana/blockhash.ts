import { browserSolanaRpcs } from "@/lib/solana/rpc-urls";

export type LatestBlockhash = {
  blockhash: string;
  lastValidBlockHeight: number;
};

async function readBlockhash(url: string): Promise<LatestBlockhash> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getLatestBlockhash",
      params: [{ commitment: "confirmed" }],
    }),
  });
  const json = (await res.json().catch(() => null)) as {
    result?: { value?: { blockhash?: string; lastValidBlockHeight?: number } };
    error?: { message?: string };
  } | null;
  const value = json?.result?.value;
  if (!value?.blockhash) {
    throw new Error(json?.error?.message ?? `Solana RPC ${res.status} from ${new URL(url).hostname}.`);
  }
  return {
    blockhash: value.blockhash,
    lastValidBlockHeight: Number(value.lastValidBlockHeight ?? 0),
  };
}

export async function fetchLatestBlockhash(rpcs: string[] = browserSolanaRpcs()): Promise<LatestBlockhash> {
  let lastError: Error | null = null;
  for (const url of rpcs) {
    try {
      return await readBlockhash(url);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Solana RPC failed.");
    }
  }
  throw new Error(lastError?.message ?? "Could not fetch a Solana blockhash. Retry.");
}

/** Browser RPCs first (no Vercel rate limit). Falls back to the pad if CORS blocks those hosts. */
export async function fetchLaunchBlockhash(): Promise<LatestBlockhash> {
  try {
    return await fetchLatestBlockhash();
  } catch (browserError) {
    if (typeof window === "undefined") throw browserError;
    const res = await fetch("/api/solana/blockhash");
    const body = (await res.json().catch(() => ({}))) as {
      blockhash?: string;
      lastValidBlockHeight?: number;
      error?: string;
    };
    if (!res.ok || !body.blockhash) {
      throw new Error(
        body.error ?? (browserError instanceof Error ? browserError.message : "Could not fetch a Solana blockhash."),
      );
    }
    return {
      blockhash: body.blockhash,
      lastValidBlockHeight: Number(body.lastValidBlockHeight ?? 0),
    };
  }
}

export function parseBlockhash(value: string | undefined | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.length < 32 || trimmed.length > 64) return null;
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)) return null;
  return trimmed;
}
