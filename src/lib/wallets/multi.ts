import "server-only";

import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { createServiceClient } from "@/lib/supabase/service";
import { generateKeypair, openKeypair, sealKeypair, encodeSecret } from "@/lib/solana/keys";
import { sealSecret, openSecret } from "@/lib/crypto/secret-box";
import { ETHEREUM, ROBINHOOD_CHAIN } from "@onceupon/config/solana";

export type DeskChain = "solana" | "eth" | "rh";

function evmInsert(chain: DeskChain, userId: string, address: string, pk: string) {
  return {
    user_id: userId,
    chain,
    address,
    ciphertext: sealSecret(pk),
  };
}

export async function ensureDeskWallets(userId: string) {
  const service = createServiceClient();
  const { data: rows } = await service.from("wallet_secrets").select("chain,address").eq("user_id", userId);
  const have = new Set((rows ?? []).map((row) => row.chain as string));
  const created: DeskChain[] = [];

  if (!have.has("solana")) {
    const keypair = generateKeypair();
    const address = keypair.publicKey.toBase58();
    await service.from("wallet_secrets").insert({
      user_id: userId,
      chain: "solana",
      address,
      ciphertext: sealKeypair(keypair),
    });
    created.push("solana");
  }

  for (const chain of ["eth", "rh"] as const) {
    if (have.has(chain)) continue;
    const pk = generatePrivateKey();
    const account = privateKeyToAccount(pk);
    await service.from("wallet_secrets").insert(evmInsert(chain, userId, account.address, pk));
    created.push(chain);
  }

  return listDeskWallets(userId, created);
}

export async function listDeskWallets(userId: string, created: DeskChain[] = []) {
  const service = createServiceClient();
  const { data } = await service.from("wallet_secrets").select("chain,address").eq("user_id", userId);
  const rows = data ?? [];
  return {
    created,
    wallets: {
      solana: rows.find((row) => row.chain === "solana")?.address ?? null,
      eth: rows.find((row) => row.chain === "eth")?.address ?? null,
      rh: rows.find((row) => row.chain === "rh")?.address ?? null,
      arc: rows.find((row) => row.chain === "eth")?.address ?? null,
    },
    explorers: {
      solana: rows.find((row) => row.chain === "solana")?.address
        ? `https://solscan.io/account/${rows.find((row) => row.chain === "solana")?.address}`
        : null,
      eth: rows.find((row) => row.chain === "eth")?.address
        ? `${ETHEREUM.explorer}/address/${rows.find((row) => row.chain === "eth")?.address}`
        : null,
      rh: rows.find((row) => row.chain === "rh")?.address
        ? `${ROBINHOOD_CHAIN.explorer}/address/${rows.find((row) => row.chain === "rh")?.address}`
        : null,
    },
  };
}

export async function exportDeskSecret(userId: string, chain: DeskChain) {
  const service = createServiceClient();
  const { data } = await service
    .from("wallet_secrets")
    .select("address,ciphertext")
    .eq("user_id", userId)
    .eq("chain", chain)
    .maybeSingle();
  if (!data?.ciphertext || !data.address) throw new Error("No wallet on that chain.");
  if (chain === "solana") {
    const keypair = openKeypair(data.ciphertext);
    // Phantom/Solflare/Backpack expect the base58-encoded 64-byte secret key on import —
    // base64 (what this used to return) isn't a format any Solana wallet recognizes.
    return { address: data.address, secret: encodeSecret(keypair) };
  }
  return { address: data.address, secret: openSecret(data.ciphertext) };
}

export async function importDeskSecret(userId: string, chain: DeskChain, secret: string) {
  const service = createServiceClient();
  if (chain === "solana") {
    const { decodeSecret, sealKeypair } = await import("@/lib/solana/keys");
    const keypair = decodeSecret(secret);
    const address = keypair.publicKey.toBase58();
    await service.from("wallet_secrets").upsert(
      { user_id: userId, chain, address, ciphertext: sealKeypair(keypair) },
      { onConflict: "user_id,chain" },
    );
    return { address };
  }
  const pk = secret.startsWith("0x") ? secret : `0x${secret}`;
  const account = privateKeyToAccount(pk as `0x${string}`);
  await service.from("wallet_secrets").upsert(
    evmInsert(chain, userId, account.address, pk),
    { onConflict: "user_id,chain" },
  );
  return { address: account.address };
}
