"use client";

import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import bs58 from "bs58";
import { useSolanaWallet } from "@/components/wallet/solana-wallet-provider";
import { readApiJson } from "@/lib/http/read-json";
import { explorerTx } from "@/lib/solana/explorer";

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

function asSignature(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string" && value.length >= 32) return value;
  if (value instanceof Uint8Array) return bs58.encode(value);
  if (ArrayBuffer.isView(value)) {
    const view = value as ArrayBufferView;
    return bs58.encode(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
  }
  if (typeof value === "object" && "signature" in value) {
    return asSignature((value as { signature: unknown }).signature);
  }
  return null;
}

function walletError(err: unknown): Error {
  const record = err as { code?: number; message?: string };
  const message = record?.message ?? (err instanceof Error ? err.message : "");
  if (record?.code === 4001 || /reject|denied|cancel/i.test(message)) {
    return new Error("Wallet closed the sign-and-pay prompt. Approve it to pay gas and continue.");
  }
  if (err instanceof Error) return err;
  return new Error(message || "Wallet did not sign and pay.");
}

function serializeSigned(signed: unknown, versioned: boolean, feePayer: string | null) {
  const raw = asBytes(signed);
  if (raw) return bytesToBase64(raw);
  if (signed && typeof signed === "object" && "serialize" in signed) {
    if (versioned) {
      return bytesToBase64((signed as VersionedTransaction).serialize());
    }
    const next = signed as Transaction;
    if (!next.feePayer && feePayer) next.feePayer = new PublicKey(feePayer);
    return bytesToBase64(next.serialize({ requireAllSignatures: false, verifySignatures: false }));
  }
  throw new Error("Wallet did not return a signed transaction.");
}

export function useWalletSigner() {
  const wallet = useSolanaWallet();

  async function broadcast(serialized: string) {
    const res = await fetch("/api/solana/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signedTx: serialized }),
    });
    const body = await readApiJson<{ error?: string; signature?: string; explorer?: string }>(res);
    if (!res.ok) throw new Error(body.error ?? "Could not land the transaction.");
    if (!body.signature) throw new Error("The pad did not return a signature.");
    return { signature: body.signature, explorer: body.explorer ?? explorerTx(body.signature) };
  }

  async function signAndSend(transactionBase64: string, versioned = false) {
    if (!wallet.address) throw new Error("Connect a Solana wallet.");
    try {
      const bytes = base64ToBytes(transactionBase64);
      const tx = versioned ? VersionedTransaction.deserialize(bytes) : Transaction.from(bytes);
      if (!versioned) {
        const legacy = tx as Transaction;
        if (!legacy.feePayer) legacy.feePayer = new PublicKey(wallet.address);
      }
      const sent = await wallet.signAndSendTransaction(tx);
      const signature = asSignature(sent);
      if (signature) return { signature, explorer: explorerTx(signature) };
      const signed =
        sent && typeof sent === "object" && "signed" in sent ? (sent as { signed: unknown }).signed : sent;
      return await broadcast(serializeSigned(signed, versioned, wallet.address));
    } catch (err) {
      throw walletError(err);
    }
  }

  return { ...wallet, signAndSend };
}
