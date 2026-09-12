import { Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createInitializeMint2Instruction,
} from "@solana/spl-token";

const rpc = process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

async function main() {
  const connection = new Connection(rpc, "confirmed");
  const payer = Keypair.generate();
  const mint = Keypair.generate();
  let airdropped = false;
  try {
    const sig = await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, "confirmed");
    airdropped = true;
  } catch (error) {
    console.log("airdrop_skipped");
    console.log(error instanceof Error ? error.message : "airdrop failed");
    process.exit(0);
  }
  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: mint.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMint2Instruction(mint.publicKey, 6, payer.publicKey, null, TOKEN_PROGRAM_ID),
  );
  const signature = await sendAndConfirmTransaction(connection, tx, [payer, mint], { commitment: "confirmed" });
  console.log(JSON.stringify({ airdropped, mint: mint.publicKey.toBase58(), signature }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "smoke failed");
  process.exit(1);
});
