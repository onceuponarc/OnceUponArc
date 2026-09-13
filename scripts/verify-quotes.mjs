import { readFileSync } from "node:fs";
import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, unpackMint } from "@solana/spl-token";

const rpc = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";
const extra = ["EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"];

async function main() {
  const src = readFileSync(new URL("../packages/config/src/quotes.ts", import.meta.url), "utf8");
  const found = [...src.matchAll(/"([1-9A-HJ-NP-Za-km-z]{32,44})"/g)].map((m) => m[1]);
  const mints = [...new Set([...found, ...extra])];
  const connection = new Connection(rpc, "confirmed");
  const missing = [];
  const badOwner = [];
  for (let i = 0; i < mints.length; i += 20) {
    const slice = mints.slice(i, i + 20).map((item) => new PublicKey(item));
    const infos = await connection.getMultipleAccountsInfo(slice);
    infos.forEach((info, idx) => {
      const mint = slice[idx].toBase58();
      if (!info) {
        missing.push(mint);
        return;
      }
      if (!info.owner.equals(TOKEN_PROGRAM_ID) && !info.owner.equals(TOKEN_2022_PROGRAM_ID)) {
        badOwner.push(mint);
        return;
      }
      unpackMint(slice[idx], info, info.owner);
    });
  }
  if (missing.length || badOwner.length) {
    console.error(JSON.stringify({ missing, badOwner }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, mints: mints.length, rpc }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "verify failed");
  process.exit(1);
});
