import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
  AuthorityType,
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddressSync,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SOLANA } from "@onceupon/config/solana";
import { PROTOCOL } from "@onceupon/config/arc";
import { solanaConnection, explorerTx } from "@/lib/solana/connection";
import { generateKeypair, protocolKeypair, sealKeypair } from "@/lib/solana/keys";
import { loadUserKeypair, requireSolBalance } from "@/lib/wallets/embedded";
import { createServiceClient } from "@/lib/supabase/service";
import type { LaunchVenue } from "@onceupon/config/solana";
import type { QuoteAsset } from "@onceupon/config/quotes";
import { graduationRaw, virtualRaw } from "@onceupon/config/quotes";
import { inspectMint, pushCreateAtaIfMissing } from "@/lib/solana/mint";

export type LaunchInput = {
  userId: string;
  handle: string;
  title: string;
  ticker: string;
  blurb: string;
  engine: "author" | "onceuponers";
  venue: LaunchVenue;
  authorBps: number;
  snipeTaxBps: number;
  quote: QuoteAsset;
  rewardMint: string | null;
  autoBuyRewards: boolean;
  nftSupply: number;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function launchOnSolana(input: LaunchInput) {
  const user = await loadUserKeypair(input.userId);
  await requireSolBalance(user.publicKey.toBase58(), 0.05);

  const isNft = input.venue === "nft";
  const decimals = isNft ? SOLANA.nftDecimals : SOLANA.defaultDecimals;
  const supplyUi = isNft ? Math.max(1, Math.min(input.nftSupply || 1, 10_000)) : SOLANA.defaultSupply;
  const rawSupply = BigInt(supplyUi) * 10n ** BigInt(decimals);

  const mint = generateKeypair();
  const curve = generateKeypair();
  const connection = solanaConnection();
  const lamports = await getMinimumBalanceForRentExemptMint(connection);

  const mintIx = SystemProgram.createAccount({
    fromPubkey: user.publicKey,
    newAccountPubkey: mint.publicKey,
    space: MINT_SIZE,
    lamports,
    programId: TOKEN_PROGRAM_ID,
  });
  const initMint = createInitializeMint2Instruction(
    mint.publicKey,
    decimals,
    user.publicKey,
    null,
    TOKEN_PROGRAM_ID,
  );

  const holder = isNft ? user.publicKey : curve.publicKey;
  const ata = getAssociatedTokenAddressSync(mint.publicKey, holder, false, TOKEN_PROGRAM_ID);
  const ataIx = createAssociatedTokenAccountInstruction(
    user.publicKey,
    ata,
    holder,
    mint.publicKey,
    TOKEN_PROGRAM_ID,
  );
  const mintTo = createMintToInstruction(
    mint.publicKey,
    ata,
    user.publicKey,
    rawSupply,
    [],
    TOKEN_PROGRAM_ID,
  );
  const revokeMint = createSetAuthorityInstruction(
    mint.publicKey,
    user.publicKey,
    AuthorityType.MintTokens,
    null,
    [],
    TOKEN_PROGRAM_ID,
  );

  const tx = new Transaction().add(mintIx, initMint, ataIx, mintTo, revokeMint);
  if (!isNft) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: user.publicKey,
        toPubkey: curve.publicKey,
        lamports: 8_000_000,
      }),
    );
    if (input.quote.mint) {
      const quoteMint = await inspectMint(input.quote.mint);
      await pushCreateAtaIfMissing(
        tx,
        user.publicKey,
        curve.publicKey,
        quoteMint.mint,
        quoteMint.programId,
      );
    }
  }

  const signers: Keypair[] = isNft ? [user, mint] : [user, mint, curve];
  const signature = await sendAndConfirmTransaction(connection, tx, signers, {
    commitment: "confirmed",
  });

  const protocol = protocolKeypair();
  const authorBps = Math.min(
    Math.max(0, input.authorBps),
    input.engine === "author" ? PROTOCOL.authorModeAuthorBpsCap : PROTOCOL.onceuponersAuthorBpsCap,
  );

  const slug = `${slugify(input.title) || slugify(input.ticker) || "launch"}-${Math.random().toString(36).slice(2, 6)}`;
  const pairClass = input.quote.pairClass;

  const service = createServiceClient();
  const { data: story, error } = await service
    .from("stories")
    .insert({
      slug,
      title: input.title.trim(),
      ticker: input.ticker.trim().toUpperCase().slice(0, 12),
      blurb: input.blurb.trim(),
      author_user_id: input.userId,
      author_wallet: user.publicKey.toBase58(),
      engine: input.engine,
      status: "live",
      token_address: mint.publicKey.toBase58(),
      vault_address: isNft ? null : curve.publicKey.toBase58(),
      fee_recipient: input.engine === "author" ? user.publicKey.toBase58() : curve.publicKey.toBase58(),
      author_bps: authorBps,
      protocol_bps: PROTOCOL.protocolBpsDefault,
      quote_address: input.quote.mint,
      pair_class: pairClass,
      pair_label: input.quote.symbol,
      rwa_issuer: input.quote.issuer,
      supply: rawSupply.toString(),
      decimals,
      rights_attested: true,
      created_tx: signature,
      chain: "solana",
      venue: input.venue,
      quote_mint: input.quote.mint,
      reward_mint: input.autoBuyRewards ? (input.rewardMint ?? input.quote.mint) : null,
      auto_buy_rewards: input.autoBuyRewards,
      curve_quote_lamports: 0,
      curve_token_raw: isNft ? 0 : rawSupply.toString(),
      mint_decimals: decimals,
      snipe_tax_bps: Math.min(Math.max(0, input.snipeTaxBps), 500),
      reward_vault_lamports: 0,
      quote_decimals: input.quote.decimals,
      virtual_quote_raw: virtualRaw(input.quote).toString(),
      graduation_quote_raw: graduationRaw(input.quote).toString(),
    })
    .select("id, slug, token_address")
    .single();

  if (error || !story) {
    throw new Error(error?.message ?? "Launch recorded on-chain but the pad could not save the Story.");
  }

  if (!isNft) {
    await service.from("curve_secrets").insert({
      story_id: story.id,
      address: curve.publicKey.toBase58(),
      ciphertext: sealKeypair(curve),
    });
    await service.from("bindings").insert({
      story_id: story.id,
      kind: input.venue === "pumpfun" ? "pump_fun" : input.venue === "pons" ? "pond" : "bonding_curve",
      is_primary: true,
      chain_caip2: SOLANA.caip2,
      pool_address: curve.publicKey.toBase58(),
      quote_address: input.quote.mint,
      dest_token_mint: mint.publicKey.toBase58(),
      mechanism: input.venue,
      fee_routing: "solana_curve",
      created_tx: signature,
      verified_at: new Date().toISOString(),
    });
  }

  return {
    slug: story.slug as string,
    mint: mint.publicKey.toBase58(),
    signature,
    explorer: explorerTx(signature),
    protocol: protocol.publicKey.toBase58(),
  };
}

export function parseMint(value: string | null): PublicKey | null {
  if (!value) return null;
  try {
    return new PublicKey(value.trim());
  } catch {
    return null;
  }
}
