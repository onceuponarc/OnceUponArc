/** Pull a Solana address out of the messy injected-wallet connect() return. */

export function injectedAddress(source: unknown): string | null {
  if (!source) return null;
  if (typeof source === "string") {
    return source.length >= 32 ? source : null;
  }
  if (typeof source !== "object") return null;
  const value = source as {
    toBase58?: () => string;
    toString?: () => string;
    publicKey?: unknown;
    pubkey?: unknown;
  };
  if (typeof value.toBase58 === "function") {
    try {
      const encoded = value.toBase58();
      if (encoded && encoded !== "[object Object]") return encoded;
    } catch {
      // fall through
    }
  }
  if (value.publicKey) return injectedAddress(value.publicKey);
  if (value.pubkey) return injectedAddress(value.pubkey);
  if (typeof value.toString === "function") {
    const encoded = value.toString();
    if (encoded && encoded !== "[object Object]" && encoded.length >= 32) return encoded;
  }
  return null;
}
