import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { createServiceClient } from "@/lib/supabase/service";
import { solanaConnection, explorerTx } from "@/lib/solana/connection";
import { openKeypair, protocolKeypair } from "@/lib/solana/keys";
import { serializePartialTx } from "@/lib/solana/partial-tx";
import { assertPayer, getBoundSolanaWallet } from "@/lib/wallets/bound";
import { quoteOutForSell, splitBuyFees, tokensOutForBuy } from "@/lib/solana/curve";
import { inspectMint, pushCreateAtaIfMissing, tokenBalance, transferCheckedIx, ataFor } from "@/lib/solana/mint";
import { findQuoteByMint, graduationRaw, rawToUi, uiToRaw, virtualRaw } from "@onceupon/config/quotes";

type StoryRow = {
  id: string;
  slug: string;
  engine: "author" | "onceuponers";
  status: string;
  author_user_id: string;
  author_wallet: string;
  token_address: string;
  vault_address: string | null;
  author_bps: number;
  protocol_bps: number;
  snipe_tax_bps: number;
  created_at: string;
  curve_quote_lamports: string | number;
  curve_token_raw: string | number;
  auto_buy_rewards: boolean;
  reward_vault_lamports: string | number;
  venue: string;
  quote_mint: string | null;
  pair_label: string;
  quote_decimals: number | null;
  virtual_quote_raw: string | number | null;
  graduation_quote_raw: string | number | null;
};

async function loadStory(slug: string) {
  const service = createServiceClient();
  const { data, error } = await service
    .from("stories")
    .select(
      "id, slug, engine, status, author_user_id, author_wallet, token_address, vault_address, author_bps, protocol_bps, snipe_tax_bps, created_at, curve_quote_lamports, curve_token_raw, auto_buy_rewards, reward_vault_lamports, venue, quote_mint, pair_label, quote_decimals, virtual_quote_raw, graduation_quote_raw",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data?.token_address) throw new Error("Launch not found.");
  return data as StoryRow;
}

function quoteMeta(story: StoryRow) {
  const listed = findQuoteByMint(story.quote_mint);
  const decimals = Number(story.quote_decimals ?? listed?.decimals ?? 9);
  const virtual =
    story.virtual_quote_raw != null
      ? BigInt(story.virtual_quote_raw)
      : listed
        ? virtualRaw(listed)
        : 30_000_000_000n;
  const graduation =
    story.graduation_quote_raw != null
      ? BigInt(story.graduation_quote_raw)
      : listed
        ? graduationRaw(listed)
        : 2_000_000_000n;
  const symbol = story.pair_label || listed?.symbol || "SOL";
  const maxBuy = listed?.maxBuyUi ?? 50;
  return { decimals, virtual, graduation, symbol, maxBuy, mint: story.quote_mint };
}

async function loadCurve(storyId: string) {
  const service = createServiceClient();
  const { data, error } = await service
    .from("curve_secrets")
    .select("ciphertext")
    .eq("story_id", storyId)
    .maybeSingle();
  if (error || !data?.ciphertext) throw new Error("This launch has no curve.");
  return openKeypair(data.ciphertext);
}

async function ensureStoryAta(payer: PublicKey, owner: PublicKey, mint: PublicKey, tx: Transaction) {
  const ata = getAssociatedTokenAddressSync(mint, owner, false, TOKEN_PROGRAM_ID);
  const info = await solanaConnection().getAccountInfo(ata);
  if (!info) {
    tx.add(createAssociatedTokenAccountInstruction(payer, ata, owner, mint, TOKEN_PROGRAM_ID));
  }
  return ata;
}

function snipeBps(story: StoryRow): number {
  const ageMs = Date.now() - new Date(story.created_at).getTime();
  if (ageMs > 15 * 60 * 1000) return 0;
  return Number(story.snipe_tax_bps ?? 0);
}

export async function buyOnCurve(userId: string, slug: string, amountUi: number, payerAddress?: string) {
  const story = await loadStory(slug);
  if (story.venue === "nft") throw new Error("NFTs do not trade on the curve.");
  if (story.status !== "live" && story.status !== "graduated") throw new Error("This launch is not trading.");

  const payer = await assertPayer(userId, payerAddress);
  const meta = quoteMeta(story);
  if (amountUi <= 0 || amountUi > meta.maxBuy) {
    throw new Error(`Buy size must be between 0 and ${meta.maxBuy} ${meta.symbol}.`);
  }

  const quoteIn = uiToRaw(amountUi, meta.decimals);
  const fees = splitBuyFees(
    quoteIn,
    Number(story.author_bps),
    Number(story.protocol_bps),
    snipeBps(story),
  );
  const quoteReserve = BigInt(story.curve_quote_lamports);
  const tokenReserve = BigInt(story.curve_token_raw);
  const tokensOut = tokensOutForBuy(quoteReserve, tokenReserve, fees.toCurve, meta.virtual);
  if (tokensOut <= 0n) throw new Error("Curve would return zero tokens.");

  const curve = await loadCurve(story.id);
  const protocol = protocolKeypair();
  const mint = new PublicKey(story.token_address);
  const tx = new Transaction();
  const userAta = await ensureStoryAta(payer, payer, mint, tx);
  const curveAta = getAssociatedTokenAddressSync(mint, curve.publicKey, false, TOKEN_PROGRAM_ID);

  const vaultCut = story.engine === "onceuponers" ? fees.author : 0n;
  const authorCut = story.engine === "author" ? fees.author : 0n;

  if (!meta.mint) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: payer,
        toPubkey: curve.publicKey,
        lamports: Number(fees.toCurve + vaultCut),
      }),
    );
    if (authorCut > 0n) {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: payer,
          toPubkey: new PublicKey(story.author_wallet),
          lamports: Number(authorCut),
        }),
      );
    }
    if (fees.protocol + fees.snipe > 0n) {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: payer,
          toPubkey: protocol.publicKey,
          lamports: Number(fees.protocol + fees.snipe),
        }),
      );
    }
  } else {
    const quote = await inspectMint(meta.mint);
    const userQuote = ataFor(quote.mint, payer, quote.programId);
    const held = await tokenBalance(userQuote, quote.programId);
    if (held < quoteIn) {
      throw new Error(`Your wallet needs ${amountUi} ${meta.symbol} to buy.`);
    }
    const curveQuote = await pushCreateAtaIfMissing(tx, payer, curve.publicKey, quote.mint, quote.programId);
    if (authorCut > 0n) {
      const authorQuote = await pushCreateAtaIfMissing(
        tx,
        payer,
        new PublicKey(story.author_wallet),
        quote.mint,
        quote.programId,
      );
      tx.add(
        transferCheckedIx({
          source: userQuote,
          mint: quote.mint,
          destination: authorQuote,
          owner: payer,
          amount: authorCut,
          decimals: quote.decimals,
          programId: quote.programId,
        }),
      );
    }
    if (fees.protocol + fees.snipe > 0n) {
      const protoQuote = await pushCreateAtaIfMissing(tx, payer, protocol.publicKey, quote.mint, quote.programId);
      tx.add(
        transferCheckedIx({
          source: userQuote,
          mint: quote.mint,
          destination: protoQuote,
          owner: payer,
          amount: fees.protocol + fees.snipe,
          decimals: quote.decimals,
          programId: quote.programId,
        }),
      );
    }
    tx.add(
      transferCheckedIx({
        source: userQuote,
        mint: quote.mint,
        destination: curveQuote,
        owner: payer,
        amount: fees.toCurve + vaultCut,
        decimals: quote.decimals,
        programId: quote.programId,
      }),
    );
  }

  tx.add(createTransferInstruction(curveAta, userAta, curve.publicKey, tokensOut, [], TOKEN_PROGRAM_ID));
  const prepared = await serializePartialTx(tx, payer, [curve]);

  return {
    transaction: prepared.transaction,
    side: "buy" as const,
    amountUi,
    tokensOut: tokensOut.toString(),
    quote: meta.symbol,
  };
}

export async function sellOnCurve(
  userId: string,
  slug: string,
  tokenUi: number,
  decimals: number,
  payerAddress?: string,
) {
  if (tokenUi <= 0) throw new Error("Sell size must be positive.");
  const story = await loadStory(slug);
  if (story.venue === "nft") throw new Error("NFTs do not trade on the curve.");

  const payer = await assertPayer(userId, payerAddress);
  const meta = quoteMeta(story);
  const tokensIn = uiToRaw(tokenUi, decimals);
  const quoteReserve = BigInt(story.curve_quote_lamports);
  const tokenReserve = BigInt(story.curve_token_raw);
  const quoteOut = quoteOutForSell(quoteReserve, tokenReserve, tokensIn, meta.virtual);
  const fees = splitBuyFees(quoteOut, Number(story.author_bps), Number(story.protocol_bps), 0);
  const userGets = fees.toCurve;
  if (userGets <= 0n) throw new Error(`Curve would return zero ${meta.symbol}.`);

  const curve = await loadCurve(story.id);
  const protocol = protocolKeypair();
  const mint = new PublicKey(story.token_address);
  const connection = solanaConnection();
  const userAta = getAssociatedTokenAddressSync(mint, payer, false, TOKEN_PROGRAM_ID);
  const curveAta = getAssociatedTokenAddressSync(mint, curve.publicKey, false, TOKEN_PROGRAM_ID);

  const held = await getAccount(connection, userAta);
  if (held.amount < tokensIn) throw new Error("Not enough tokens.");

  const tx = new Transaction().add(
    createTransferInstruction(userAta, curveAta, payer, tokensIn, [], TOKEN_PROGRAM_ID),
  );

  if (!meta.mint) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: curve.publicKey,
        toPubkey: payer,
        lamports: Number(userGets),
      }),
    );
    if (story.engine === "author" && fees.author > 0n) {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: curve.publicKey,
          toPubkey: new PublicKey(story.author_wallet),
          lamports: Number(fees.author),
        }),
      );
    }
    if (fees.protocol > 0n) {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: curve.publicKey,
          toPubkey: protocol.publicKey,
          lamports: Number(fees.protocol),
        }),
      );
    }
  } else {
    const quote = await inspectMint(meta.mint);
    const curveQuote = ataFor(quote.mint, curve.publicKey, quote.programId);
    const userQuote = await pushCreateAtaIfMissing(tx, payer, payer, quote.mint, quote.programId);
    tx.add(
      transferCheckedIx({
        source: curveQuote,
        mint: quote.mint,
        destination: userQuote,
        owner: curve.publicKey,
        amount: userGets,
        decimals: quote.decimals,
        programId: quote.programId,
      }),
    );
    if (story.engine === "author" && fees.author > 0n) {
      const authorQuote = await pushCreateAtaIfMissing(
        tx,
        payer,
        new PublicKey(story.author_wallet),
        quote.mint,
        quote.programId,
      );
      tx.add(
        transferCheckedIx({
          source: curveQuote,
          mint: quote.mint,
          destination: authorQuote,
          owner: curve.publicKey,
          amount: fees.author,
          decimals: quote.decimals,
          programId: quote.programId,
        }),
      );
    }
    if (fees.protocol > 0n) {
      const protoQuote = await pushCreateAtaIfMissing(tx, payer, protocol.publicKey, quote.mint, quote.programId);
      tx.add(
        transferCheckedIx({
          source: curveQuote,
          mint: quote.mint,
          destination: protoQuote,
          owner: curve.publicKey,
          amount: fees.protocol,
          decimals: quote.decimals,
          programId: quote.programId,
        }),
      );
    }
  }

  const prepared = await serializePartialTx(tx, payer, [curve]);
  return {
    transaction: prepared.transaction,
    side: "sell" as const,
    amountUi: tokenUi,
    quoteOut: rawToUi(userGets, meta.decimals),
    quote: meta.symbol,
  };
}

export async function claimPiece(userId: string, slug: string, payerAddress?: string) {
  const story = await loadStory(slug);
  if (story.engine !== "onceuponers") throw new Error("Author launches push fees. There is nothing to claim.");
  const reward = BigInt(story.reward_vault_lamports);
  if (reward <= 0n) throw new Error("The vault is empty.");
  const meta = quoteMeta(story);

  const payer = await assertPayer(userId, payerAddress);
  const curve = await loadCurve(story.id);
  const mint = new PublicKey(story.token_address);
  const connection = solanaConnection();
  const userAta = getAssociatedTokenAddressSync(mint, payer, false, TOKEN_PROGRAM_ID);
  const held = await getAccount(connection, userAta).catch(() => null);
  if (!held || held.amount === 0n) throw new Error("You need to hold the token to claim The Piece.");

  const share = (reward * held.amount) / (held.amount + BigInt(story.curve_token_raw));
  if (share <= 0n) throw new Error("Your share rounds to zero.");

  const tx = new Transaction();
  if (!meta.mint) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: curve.publicKey,
        toPubkey: payer,
        lamports: Number(share),
      }),
    );
  } else {
    const quote = await inspectMint(meta.mint);
    const curveQuote = ataFor(quote.mint, curve.publicKey, quote.programId);
    const userQuote = await pushCreateAtaIfMissing(tx, payer, payer, quote.mint, quote.programId);
    tx.add(
      transferCheckedIx({
        source: curveQuote,
        mint: quote.mint,
        destination: userQuote,
        owner: curve.publicKey,
        amount: share,
        decimals: quote.decimals,
        programId: quote.programId,
      }),
    );
  }

  const prepared = await serializePartialTx(tx, payer, [curve]);
  return {
    transaction: prepared.transaction,
    side: "claim" as const,
    amountUi: 0,
    amount: rawToUi(share, meta.decimals),
    quote: meta.symbol,
  };
}

export async function confirmCurveTrade(
  userId: string,
  slug: string,
  signature: string,
  side: "buy" | "sell" | "claim",
  amountUi: number,
  decimals: number,
  payerAddress?: string,
) {
  const story = await loadStory(slug);
  const meta = quoteMeta(story);
  const service = createServiceClient();
  const bound = await getBoundSolanaWallet(userId);
  const trader = payerAddress
    ? (await assertPayer(userId, payerAddress)).toBase58()
    : bound ?? story.author_wallet;

  if (side === "buy") {
    const quoteIn = uiToRaw(amountUi, meta.decimals);
    const fees = splitBuyFees(quoteIn, Number(story.author_bps), Number(story.protocol_bps), snipeBps(story));
    const quoteReserve = BigInt(story.curve_quote_lamports);
    const tokenReserve = BigInt(story.curve_token_raw);
    const tokensOut = tokensOutForBuy(quoteReserve, tokenReserve, fees.toCurve, meta.virtual);
    const nextQuote = quoteReserve + fees.toCurve;
    const nextTokens = tokenReserve - tokensOut;
    let rewardVault = BigInt(story.reward_vault_lamports);
    if (story.engine === "onceuponers") rewardVault += fees.author;
    const graduated = nextQuote >= meta.graduation;
    await service
      .from("stories")
      .update({
        curve_quote_lamports: nextQuote.toString(),
        curve_token_raw: nextTokens.toString(),
        reward_vault_lamports: rewardVault.toString(),
        status: graduated ? "graduated" : story.status,
      })
      .eq("id", story.id);
    await service.from("trades").insert({
      story_id: story.id,
      tx_hash: signature,
      log_index: 0,
      trader,
      side: "buy",
      token_in: meta.mint ?? "SOL",
      token_out: story.token_address,
      amount_in: quoteIn.toString(),
      amount_out: tokensOut.toString(),
    });
    if (story.engine === "onceuponers" && fees.author > 0n) {
      await service.from("fee_events").insert({
        story_id: story.id,
        tx_hash: signature,
        log_index: 1,
        block_number: 0,
        swapper: trader,
        asset: meta.mint ?? "SOL",
        author_amount: 0,
        vault_amount: fees.author.toString(),
        protocol_amount: (fees.protocol + fees.snipe).toString(),
      });
    }
    return {
      signature,
      explorer: explorerTx(signature),
      tokensOut: tokensOut.toString(),
      graduated,
      quote: meta.symbol,
    };
  }

  if (side === "sell") {
    const tokensIn = uiToRaw(amountUi, decimals);
    const quoteReserve = BigInt(story.curve_quote_lamports);
    const tokenReserve = BigInt(story.curve_token_raw);
    const quoteOut = quoteOutForSell(quoteReserve, tokenReserve, tokensIn, meta.virtual);
    const fees = splitBuyFees(quoteOut, Number(story.author_bps), Number(story.protocol_bps), 0);
    const userGets = fees.toCurve;
    const rewardAdd = story.engine === "onceuponers" ? fees.author : 0n;
    await service
      .from("stories")
      .update({
        curve_quote_lamports: (quoteReserve - quoteOut).toString(),
        curve_token_raw: (tokenReserve + tokensIn).toString(),
        reward_vault_lamports: (BigInt(story.reward_vault_lamports) + rewardAdd).toString(),
      })
      .eq("id", story.id);
    await service.from("trades").insert({
      story_id: story.id,
      tx_hash: signature,
      log_index: 0,
      trader,
      side: "sell",
      token_in: story.token_address,
      token_out: meta.mint ?? "SOL",
      amount_in: tokensIn.toString(),
      amount_out: userGets.toString(),
    });
    return {
      signature,
      explorer: explorerTx(signature),
      quoteOut: rawToUi(userGets, meta.decimals),
      quote: meta.symbol,
    };
  }

  const reward = BigInt(story.reward_vault_lamports);
  const mint = new PublicKey(story.token_address);
  const userAta = getAssociatedTokenAddressSync(mint, new PublicKey(trader), false, TOKEN_PROGRAM_ID);
  const held = await getAccount(solanaConnection(), userAta).catch(() => null);
  const share =
    held && held.amount > 0n
      ? (reward * held.amount) / (held.amount + BigInt(story.curve_token_raw))
      : 0n;
  await service
    .from("stories")
    .update({ reward_vault_lamports: (reward - share).toString() })
    .eq("id", story.id);
  await service.from("piece_claims").insert({
    story_id: story.id,
    user_id: userId,
    wallet: trader,
    tx_hash: signature,
    asset: meta.mint ?? "SOL",
    amount: share.toString(),
  });
  return {
    signature,
    explorer: explorerTx(signature),
    amount: rawToUi(share, meta.decimals),
    quote: meta.symbol,
  };
}
