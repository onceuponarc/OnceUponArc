"use client";

import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
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

function asBytes(value: unknown): Uint8Array | null {
  if (value instanceof Uint8Array) return value;
  if (value && typeof value === "object" && ArrayBuffer.isView(value)) {
    const view = value as ArrayBufferView;
    return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
  }
  return null;
}

export function useWalletSigner() {
  const wallet = useSolanaWallet();

  async function signAndSend(transactionBase64: string, versioned = false) {
    if (!wallet.address) throw new Error("Connect a Solana wallet.");
    const bytes = base64ToBytes(transactionBase64);
    let serialized: string;
    if (versioned) {
      const tx = VersionedTransaction.deserialize(bytes);
      const signed = await wallet.signTransaction(tx);
      const raw = asBytes(signed);
      if (raw) {
        serialized = bytesToBase64(raw);
      } else if (signed && typeof signed === "object" && "serialize" in signed) {
        serialized = bytesToBase64((signed as VersionedTransaction).serialize());
      } else {
        throw new Error("Wallet did not return a signed transaction.");
      }
    } else {
      const tx = Transaction.from(bytes);
      if (!tx.feePayer) tx.feePayer = new PublicKey(wallet.address);
      const signed = await wallet.signTransaction(tx);
      const raw = asBytes(signed);
      if (raw) {
        serialized = bytesToBase64(raw);
      } else if (signed && typeof signed === "object" && "serialize" in signed) {
        const next = signed as Transaction;
        if (!next.feePayer) next.feePayer = new PublicKey(wallet.address);
        serialized = bytesToBase64(next.serialize());
      } else {
        throw new Error("Wallet did not return a signed transaction.");
      }
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
