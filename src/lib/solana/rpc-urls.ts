/** Public Solana RPCs. The first extra env URL wins when set. */

export const PUBLIC_SOLANA_RPCS = [
  "https://api.mainnet-beta.solana.com",
  "https://solana-rpc.publicnode.com",
] as const;

export function browserSolanaRpcs(): string[] {
  const extra = process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim();
  const out: string[] = extra ? [extra] : [];
  for (const url of PUBLIC_SOLANA_RPCS) {
    if (!out.includes(url)) out.push(url);
  }
  return out;
}

export function serverSolanaRpcs(): string[] {
  const extra = [process.env.SOLANA_RPC_URL?.trim(), process.env.NEXT_PUBLIC_SOLANA_RPC_URL?.trim()].filter(
    (url): url is string => Boolean(url),
  );
  const out: string[] = [];
  for (const url of [...extra, ...PUBLIC_SOLANA_RPCS]) {
    if (!out.includes(url)) out.push(url);
  }
  return out;
}
