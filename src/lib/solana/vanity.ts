import { Keypair } from "@solana/web3.js";

export const VANITY_SUFFIX = "obx";

export function mintEndsWith(address: string, suffix = VANITY_SUFFIX) {
  return address.toLowerCase().endsWith(suffix.toLowerCase());
}

export function generateVanityMint(suffix = VANITY_SUFFIX, budgetMs = 8_000) {
  const start = Date.now();
  let tries = 0;
  while (Date.now() - start < budgetMs) {
    const keypair = Keypair.generate();
    tries += 1;
    if (mintEndsWith(keypair.publicKey.toBase58(), suffix)) {
      return { keypair, tries, vanity: true };
    }
  }
  return { keypair: Keypair.generate(), tries, vanity: false };
}
