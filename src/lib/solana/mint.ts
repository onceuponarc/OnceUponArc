import { PublicKey } from "@solana/web3.js";
import {
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  unpackMint,
} from "@solana/spl-token";
import { solanaConnection } from "@/lib/solana/connection";

export type MintMeta = {
  mint: PublicKey;
  decimals: number;
  programId: PublicKey;
};

export function isTokenProgram(owner: PublicKey): boolean {
  return owner.equals(TOKEN_PROGRAM_ID) || owner.equals(TOKEN_2022_PROGRAM_ID);
}

export async function inspectMint(address: string | PublicKey): Promise<MintMeta> {
  const mint = typeof address === "string" ? new PublicKey(address) : address;
  const info = await solanaConnection().getAccountInfo(mint, "confirmed");
  if (!info) throw new Error("That mint is not on Solana mainnet.");
  if (!isTokenProgram(info.owner)) throw new Error("That address is not an SPL or Token-2022 mint.");
  const unpacked = unpackMint(mint, info, info.owner);
  return { mint, decimals: unpacked.decimals, programId: info.owner };
}

export function ataFor(mint: PublicKey, owner: PublicKey, programId: PublicKey) {
  return getAssociatedTokenAddressSync(mint, owner, false, programId);
}

export async function pushCreateAtaIfMissing(
  tx: import("@solana/web3.js").Transaction,
  payer: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  programId: PublicKey,
) {
  const ata = ataFor(mint, owner, programId);
  const info = await solanaConnection().getAccountInfo(ata, "confirmed");
  if (!info) {
    tx.add(createAssociatedTokenAccountInstruction(payer, ata, owner, mint, programId));
  }
  return ata;
}

export async function tokenBalance(ata: PublicKey, programId: PublicKey): Promise<bigint> {
  try {
    const account = await getAccount(solanaConnection(), ata, "confirmed", programId);
    return account.amount;
  } catch {
    return 0n;
  }
}

export function transferCheckedIx(opts: {
  source: PublicKey;
  mint: PublicKey;
  destination: PublicKey;
  owner: PublicKey;
  amount: bigint;
  decimals: number;
  programId: PublicKey;
}) {
  return createTransferCheckedInstruction(
    opts.source,
    opts.mint,
    opts.destination,
    opts.owner,
    opts.amount,
    opts.decimals,
    [],
    opts.programId,
  );
}
