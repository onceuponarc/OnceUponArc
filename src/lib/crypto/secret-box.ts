import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function kek(): Buffer {
  const raw =
    process.env.EMBEDDED_WALLET_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "onceupon-dev-only-change-me";
  return createHash("sha256").update(`onceupon-embedded-wallet:${raw}`).digest();
}

/** AES-256-GCM blob. Never log the plaintext or this ciphertext in request traces. */
export function sealSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", kek(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function openSecret(blob: string): string {
  try {
    const buf = Buffer.from(blob, "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", kek(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
  } catch {
    throw new Error("Wallet unlock failed.");
  }
}

export function redactWalletError(error: unknown): string {
  const text = error instanceof Error ? error.message : "Wallet action failed.";
  return text.replace(/[1-9A-HJ-NP-Za-km-z]{32,88}/g, "[redacted]");
}
