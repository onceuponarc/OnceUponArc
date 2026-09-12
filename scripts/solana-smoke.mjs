import { Connection } from "@solana/web3.js";

const rpc = process.env.SOLANA_RPC_URL ?? "https://api.mainnet-beta.solana.com";

async function main() {
  const connection = new Connection(rpc, "confirmed");
  const version = await connection.getVersion();
  const slot = await connection.getSlot();
  console.log(JSON.stringify({ cluster: "mainnet-beta", rpc, version, slot }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "smoke failed");
  process.exit(1);
});
