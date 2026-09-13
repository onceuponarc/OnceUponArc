import { Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { solanaConnection } from "@/lib/solana/connection";

export async function serializePartialTx(tx: Transaction, feePayer: PublicKey, extraSigners: Keypair[]) {
  const connection = solanaConnection();
  const latest = await connection.getLatestBlockhash("confirmed");
  tx.feePayer = feePayer;
  tx.recentBlockhash = latest.blockhash;
  if (extraSigners.length) tx.partialSign(...extraSigners);
  return {
    transaction: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString("base64"),
    lastValidBlockHeight: latest.lastValidBlockHeight,
  };
}

export async function sendSignedTx(signedBase64: string) {
  const connection = solanaConnection();
  const raw = Buffer.from(signedBase64, "base64");
  return connection.sendRawTransaction(raw, { skipPreflight: false, maxRetries: 3 });
}

export function explorerFromSig(signature: string) {
  return `https://explorer.solana.com/tx/${signature}`;
}

export async function waitForTx(signature: string) {
  const connection = solanaConnection();
  const latest = await connection.getLatestBlockhash("confirmed");
  await connection.confirmTransaction({ signature, ...latest }, "confirmed");
}
