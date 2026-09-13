import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
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
import { SOLANA, type LaunchVenue, type PrintableChain } from "@onceupon/config/solana";
import { PROTOCOL } from "@onceupon/config/arc";
import { solanaConnection, explorerTx } from "@/lib/solana/connection";
import { serializePartialTx } from "@/lib/solana/partial-tx";
import { generateKeypair, protocolKeypair, sealKeypair } from "@/lib/solana/keys";
import { parsePayer } from "@/lib/wallets/bound";
import { createServiceClient } from "@/lib/supabase/service";
import type { QuoteAsset } from "@onceupon/config/quotes";
import { graduationRaw, virtualRaw } from "@onceupon/config/quotes";
import { inspectMint, pushCreateAtaIfMissing } from "@/lib/solana/mint";

export type LaunchInput = {
  userId: string;
  handle: string;
  chain: PrintableChain;
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
  payer: string;
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function launchOnSolana(input: LaunchInput) {
  const payer = parsePayer(input.payer);
  const isNft = input.venue === "nft";
  const decimals = isNft ? SOLANA.nftDecimals : SOLANA.defaultDecimals;
  const supplyUi = isNft ? Math.max(1, Math.min(input.nftSupply || 1, 10_000)) : SOLANA.defaultSupply;
  const rawSupply = BigInt(supplyUi) * 10n ** BigInt(decimals);

  const mint = generateKeypair();
  const curve = generateKeypair();
  const connection = solanaConnection();
  const lamports = await getMinimumBalanceForRentExemptMint(connection);

  const mintIx = SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: mint.publicKey,
    space: MINT_SIZE,
    lamports,
    programId: TOKEN_PROGRAM_ID,
  });
  const initMint = createInitializeMint2Instruction(
    mint.publicKey,
    decimals,
    payer,
    null,
    TOKEN_PROGRAM_ID,
  );

  const holder = isNft ? payer : curve.publicKey;
  const ata = getAssociatedTokenAddressSync(mint.publicKey, holder, false, TOKEN_PROGRAM_ID);
  const ataIx = createAssociatedTokenAccountInstruction(
    payer,
    ata,
    holder,
    mint.publicKey,
    TOKEN_PROGRAM_ID,
  );
  const mintTo = createMintToInstruction(
    mint.publicKey,
    ata,
    payer,
    rawSupply,
    [],
    TOKEN_PROGRAM_ID,
  );
  const revokeMint = createSetAuthorityInstruction(
    mint.publicKey,
    payer,
    AuthorityType.MintTokens,
    null,
    [],
    TOKEN_PROGRAM_ID,
  );

  const tx = new Transaction().add(mintIx, initMint, ataIx, mintTo, revokeMint);
  if (!isNft) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: curve.publicKey,
        lamports: 8_000_000,
      }),
    );
    if (input.quote.mint) {
      const quoteMint = await inspectMint(input.quote.mint);
      await pushCreateAtaIfMissing(
        tx,
        payer,
        curve.publicKey,
        quoteMint.mint,
        quoteMint.programId,
      );
    }
  }

  const extraSigners: Keypair[] = isNft ? [mint] : [mint, curve];
  const prepared = await serializePartialTx(tx, payer, extraSigners);

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
      author_wallet: payer.toBase58(),
      engine: input.engine,
      status: "draft",
      token_address: mint.publicKey.toBase58(),
      vault_address: isNft ? null : curve.publicKey.toBase58(),
      fee_recipient: input.engine === "author" ? payer.toBase58() : curve.publicKey.toBase58(),
      author_bps: authorBps,
      protocol_bps: PROTOCOL.protocolBpsDefault,
      quote_address: input.quote.mint,
      pair_class: pairClass,
      pair_label: input.quote.symbol,
      rwa_issuer: input.quote.issuer,
      supply: rawSupply.toString(),
      decimals,
      rights_attested: true,
      created_tx: null,
      chain: input.chain,
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
    throw new Error(error?.message ?? "The pad could not save the Story.");
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
      created_tx: null,
      verified_at: null,
    });
  }

  return {
    slug: story.slug as string,
    mint: mint.publicKey.toBase58(),
    transaction: prepared.transaction,
    protocol: protocol.publicKey.toBase58(),
  };
}

export async function confirmLaunch(userId: string, slug: string, signature: string) {
  const service = createServiceClient();
  const { data: story } = await service
    .from("stories")
    .select("id, slug, author_user_id, status")
    .eq("slug", slug)
    .maybeSingle();
  if (!story || story.author_user_id !== userId) throw new Error("Launch not found.");
  await service
    .from("stories")
    .update({ status: "live", created_tx: signature })
    .eq("id", story.id);
  await service
    .from("bindings")
    .update({ created_tx: signature, verified_at: new Date().toISOString() })
    .eq("story_id", story.id);
  return { slug: story.slug as string, signature, explorer: explorerTx(signature) };
}

export function parseMint(value: string | null): PublicKey | null {
  if (!value) return null;
  try {
    return new PublicKey(value.trim());
  } catch {
    return null;
  }
}
