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
import {
  PAD_NAME,
  PAD_URL,
  feesForVenue,
  preferDexForVenue,
  tokenMetadataUri,
} from "@onceupon/config/launchpad";
import { solanaConnection, explorerTx } from "@/lib/solana/connection";
import { serializePartialTx } from "@/lib/solana/partial-tx";
import { generateKeypair, protocolKeypair, sealKeypair } from "@/lib/solana/keys";
import { parsePayer } from "@/lib/wallets/bound";
import { createServiceClient } from "@/lib/supabase/service";
import type { QuoteAsset } from "@onceupon/config/quotes";
import { graduationRaw, virtualRaw } from "@onceupon/config/quotes";
import { CHAIN_POOLS, bindingKindForDex, canonicalPoolsForQuote, type DexId } from "@onceupon/config/pools";
import { type ResolvedPool } from "@/lib/pools/resolve";
import { createMetadataV3Instruction } from "@/lib/solana/token-metadata";

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
  linkedPool?: ResolvedPool | null;
  coverUrl?: string | null;
  imageUri?: string | null;
  twitterUrl?: string | null;
  telegramUrl?: string | null;
  websiteUrl?: string | null;
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
  const metadataUri = tokenMetadataUri(mint.publicKey.toBase58());
  const metadataIx = createMetadataV3Instruction({
    mint: mint.publicKey,
    mintAuthority: payer,
    payer,
    updateAuthority: payer,
    name: input.title.trim().slice(0, 32),
    symbol: input.ticker.trim().toUpperCase().slice(0, 10),
    uri: metadataUri,
  });
  const revokeMint = createSetAuthorityInstruction(
    mint.publicKey,
    payer,
    AuthorityType.MintTokens,
    null,
    [],
    TOKEN_PROGRAM_ID,
  );

  const tx = new Transaction().add(mintIx, initMint, ataIx, mintTo, metadataIx, revokeMint);
  if (!isNft) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: curve.publicKey,
        lamports: 8_000_000,
      }),
    );
  }

  const extraSigners: Keypair[] = isNft ? [mint] : [mint, curve];
  const prepared = await serializePartialTx(tx, payer, extraSigners);

  const protocol = protocolKeypair();
  const venueFees = feesForVenue(input.venue, input.engine);
  const authorBps = Math.min(
    Math.max(0, input.authorBps ?? venueFees.authorBps),
    input.engine === "author" ? PROTOCOL.authorModeAuthorBpsCap : PROTOCOL.onceuponersAuthorBpsCap,
  );
  const protocolBps = venueFees.protocolBps;

  const slug = `${slugify(input.title) || slugify(input.ticker) || "launch"}-${Math.random().toString(36).slice(2, 6)}`;
  const pairClass = input.quote.pairClass;
  const coverUrl = input.coverUrl?.trim() || `${PAD_URL}/onceupon-cover.svg`;
  const imageUri = input.imageUri?.trim() || coverUrl;

  const linked = await collectLinkedPools(input);
  const paired = linked[0] ?? null;

  const service = createServiceClient();
  const storyRow: Record<string, unknown> = {
    slug,
    title: input.title.trim(),
    ticker: input.ticker.trim().toUpperCase().slice(0, 12),
    blurb: input.blurb.trim(),
    cover_url: coverUrl,
    image_uri: imageUri,
    metadata_uri: metadataUri,
    twitter_url: input.twitterUrl,
    telegram_url: input.telegramUrl,
    website_url: input.websiteUrl,
    author_user_id: input.userId,
    author_wallet: payer.toBase58(),
    engine: input.engine,
    status: "draft",
    token_address: mint.publicKey.toBase58(),
    vault_address: isNft ? null : curve.publicKey.toBase58(),
    fee_recipient: input.engine === "author" ? payer.toBase58() : curve.publicKey.toBase58(),
    author_bps: authorBps,
    protocol_bps: protocolBps,
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
    snipe_tax_bps: Math.min(Math.max(0, input.snipeTaxBps ?? venueFees.snipeTaxBps), 500),
    reward_vault_lamports: 0,
    quote_decimals: input.quote.decimals,
    virtual_quote_raw: virtualRaw(input.quote).toString(),
    graduation_quote_raw: graduationRaw(input.quote).toString(),
    linked_pool_address: paired?.address ?? null,
    linked_pool_dex: paired?.dex ?? null,
    linked_pool_label: paired?.label ?? null,
  };

  const inserted = await insertStory(service, storyRow);
  const story = inserted.data;
  const error = inserted.error;

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
      mechanism: "onceupon_curve",
      fee_routing: "solana_curve",
      created_tx: null,
      verified_at: null,
    });
  }

  for (const pool of linked) {
    const { error: linkError } = await service.from("bindings").insert({
      story_id: story.id,
      kind: bindingKindForDex(pool.dex as DexId),
      is_primary: false,
      chain_caip2: pool.chainCaip2,
      pool_address: pool.address,
      quote_address: pool.quoteAddress ?? input.quote.mint,
      dest_token_mint: mint.publicKey.toBase58(),
      mechanism: pool.dex,
      fee_routing: pool.chain === "solana" ? "jupiter" : "foreign_pool",
      proof_url: pool.url || null,
      depth_usd: pool.liquidityUsd || null,
      created_tx: null,
      verified_at: null,
    });
    if (linkError) {
      console.error("Linked pool bind failed", linkError.message);
    }
  }

  return {
    slug: story.slug as string,
    mint: mint.publicKey.toBase58(),
    transaction: prepared.transaction,
    protocol: protocol.publicKey.toBase58(),
    vault: isNft ? null : curve.publicKey.toBase58(),
    linked: linked.map((pool) => ({
      dex: pool.dex,
      address: pool.address,
      label: pool.label,
      url: pool.url,
      chain: pool.chain,
    })),
    pad: PAD_NAME,
    metadataUri,
  };
}

const EXTRA_STORY_COLUMNS = [
  "twitter_url",
  "telegram_url",
  "website_url",
  "image_uri",
  "metadata_uri",
  "linked_pool_address",
  "linked_pool_dex",
  "linked_pool_label",
];

async function insertStory(
  service: ReturnType<typeof createServiceClient>,
  row: Record<string, unknown>,
) {
  const first = await service.from("stories").insert(row).select("id, slug, token_address").single();
  if (!first.error) return first;
  const missing = EXTRA_STORY_COLUMNS.some((col) => (first.error.message ?? "").includes(col));
  if (!missing) return first;
  const slim = { ...row };
  for (const col of EXTRA_STORY_COLUMNS) delete slim[col];
  return service.from("stories").insert(slim).select("id, slug, token_address").single();
}

async function collectLinkedPools(input: LaunchInput): Promise<ResolvedPool[]> {
  const prefer = preferDexForVenue(input.venue);
  const quoteId = input.quote.id;
  const solUsdc = quoteId === "sol" || quoteId === "usdc";
  const picked = input.linkedPool ?? null;
  const fallback: ResolvedPool[] = [];
  const matching = canonicalPoolsForQuote(quoteId);
  const solana = matching.length
    ? matching
    : solUsdc
      ? CHAIN_POOLS.solana.canonicalPools.filter((pool) => pool.quoteId === "sol" || pool.quoteId === "usdc")
      : [];
  for (const pool of solana) {
    fallback.push({
      id: `solana:${pool.address}`,
      dex: pool.dex,
      address: pool.address,
      label: pool.label,
      liquidityUsd: pool.liquidityUsd,
      url: pool.url,
      chain: "solana",
      chainCaip2: SOLANA.caip2,
      quoteAddress: input.quote.mint,
      source: "canonical",
    });
  }
  if (solUsdc && prefer === "pumpswap") {
    const pump = CHAIN_POOLS.solana.canonicalPools.find((pool) => pool.dex === "pumpswap");
    if (pump) {
      fallback.unshift({
        id: `solana:${pump.address}`,
        dex: pump.dex,
        address: pump.address,
        label: pump.label,
        liquidityUsd: pump.liquidityUsd,
        url: pump.url,
        chain: "solana",
        chainCaip2: SOLANA.caip2,
        quoteAddress: input.quote.mint,
        source: "canonical",
      });
    }
  }
  if (input.chain !== "solana") {
    const catalog = CHAIN_POOLS[input.chain];
    const dest =
      catalog.canonicalPools.find((pool) => pool.quoteId === quoteId) ?? catalog.canonicalPools[0];
    if (dest) {
      fallback.push({
        id: `${catalog.id}:${dest.address}`,
        dex: dest.dex,
        address: dest.address,
        label: dest.label,
        liquidityUsd: dest.liquidityUsd,
        url: dest.url,
        chain: catalog.id,
        chainCaip2: catalog.caip2,
        quoteAddress: input.quote.mint,
        source: "canonical",
      });
    }
  }

  const out: ResolvedPool[] = [];
  const seen = new Set<string>();
  const push = (pool: ResolvedPool | null | undefined) => {
    if (!pool) return;
    const key = `${pool.chainCaip2}:${pool.address.toLowerCase()}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(pool);
  };

  push(picked);
  for (const pool of fallback) push(pool);
  return out.slice(0, 3);
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
