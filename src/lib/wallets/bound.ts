import "server-only";

import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { SOLANA } from "@onceupon/config/solana";
import { createServiceClient } from "@/lib/supabase/service";
import { solanaConnection } from "@/lib/solana/connection";

export async function getBoundSolanaWallet(userId: string): Promise<string | null> {
  const service = createServiceClient();
  const { data } = await service
    .from("user_wallets")
    .select("address")
    .eq("user_id", userId)
    .eq("chain_caip2", SOLANA.caip2)
    .order("is_primary", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data?.address ?? null;
}

export function parsePayer(address: string | undefined | null): PublicKey {
  if (!address) throw new Error("Connect a Solana wallet first.");
  try {
    return new PublicKey(address);
  } catch {
    throw new Error("That is not a Solana address.");
  }
}

export async function assertPayer(userId: string, payer: string | undefined | null): Promise<PublicKey> {
  const parsed = parsePayer(payer);
  const bound = await getBoundSolanaWallet(userId);
  if (bound && bound !== parsed.toBase58()) {
    throw new Error("Sign with the Solana wallet bound to this X account.");
  }
  return parsed;
}

export async function solBalance(address: string): Promise<number> {
  const lamports = await solanaConnection().getBalance(new PublicKey(address));
  return lamports / LAMPORTS_PER_SOL;
}
