"use client";

import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { useSolanaWallet } from "@/components/wallet/solana-wallet-provider";

function bytesToBase64(bytes: Uint8Array) {
  let bin = "";
  bytes.forEach((byte) => {
    bin += String.fromCharCode(byte);
  });
  return btoa(bin);
}

function base64ToBytes(value: string) {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

export function useWalletSigner() {
  const wallet = useSolanaWallet();

  async function signAndSend(transactionBase64: string, versioned = false) {
    if (!wallet.address) throw new Error("Connect a Solana wallet.");
    const bytes = base64ToBytes(transactionBase64);
    let serialized: string;
    if (versioned) {
      const tx = VersionedTransaction.deserialize(bytes);
      const signed = (await wallet.signTransaction(tx)) as VersionedTransaction;
      serialized = bytesToBase64(signed.serialize());
    } else {
      const tx = Transaction.from(bytes);
      const signed = (await wallet.signTransaction(tx)) as Transaction;
      serialized = bytesToBase64(signed.serialize());
    }
    const res = await fetch("/api/solana/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signedTx: serialized }),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? "Could not land the transaction.");
    return body as { signature: string; explorer: string };
  }

  return { ...wallet, signAndSend };
}
