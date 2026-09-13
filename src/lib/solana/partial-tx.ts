import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { solanaConnections } from "@/lib/solana/connection";
import { fetchLatestBlockhash, parseBlockhash } from "@/lib/solana/blockhash";
import { serverSolanaRpcs } from "@/lib/solana/rpc-urls";

const MAX_TX_BYTES = 1232;

export async function serializePartialTx(
  tx: Transaction,
  feePayer: PublicKey,
  extraSigners: Keypair[],
  recentBlockhash?: string | null,
) {
  const blockhash = parseBlockhash(recentBlockhash);
  const latest = blockhash
    ? { blockhash, lastValidBlockHeight: 0 }
    : await fetchLatestBlockhash(serverSolanaRpcs());
  tx.feePayer = feePayer;
  tx.recentBlockhash = latest.blockhash;
  if (extraSigners.length) tx.partialSign(...extraSigners);
  const raw = tx.serialize({ requireAllSignatures: false, verifySignatures: false });
  if (raw.length > MAX_TX_BYTES) {
    throw new Error("Mint transaction is too large for Solana. Shorten the name or ticker and retry.");
  }
  return {
    transaction: raw.toString("base64"),
    lastValidBlockHeight: latest.lastValidBlockHeight,
  };
}

export async function sendSignedTx(signedBase64: string) {
  const raw = Buffer.from(signedBase64, "base64");
  let lastError: unknown;
  for (const connection of solanaConnections()) {
    try {
      return await connection.sendRawTransaction(raw, { skipPreflight: false, maxRetries: 3 });
    } catch (error) {
      lastError = error;
    }
  }
  const fallback = solanaConnections()[0];
  if (fallback) {
    try {
      return await fallback.sendRawTransaction(raw, { skipPreflight: true, maxRetries: 3 });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Could not land the transaction.");
}

export function explorerFromSig(signature: string) {
  return `https://explorer.solana.com/tx/${signature}`;
}

export async function waitForTx(signature: string) {
  let lastError: unknown;
  for (const connection of solanaConnections()) {
    try {
      const latest = await connection.getLatestBlockhash("confirmed");
      await connection.confirmTransaction({ signature, ...latest }, "confirmed");
      return;
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) throw lastError;
}

export { parseBlockhash };
