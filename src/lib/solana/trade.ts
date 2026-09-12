import {
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
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
import { loadUserKeypair } from "@/lib/wallets/embedded";
import { quoteOutForSell, splitBuyFees, tokensOutForBuy, graduationLamports } from "@/lib/solana/curve";

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
};

async function loadStory(slug: string) {
  const service = createServiceClient();
  const { data, error } = await service
    .from("stories")
    .select(
      "id, slug, engine, status, author_user_id, author_wallet, token_address, vault_address, author_bps, protocol_bps, snipe_tax_bps, created_at, curve_quote_lamports, curve_token_raw, auto_buy_rewards, reward_vault_lamports, venue",
    )
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data?.token_address) throw new Error("Launch not found.");
  return data as StoryRow;
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

async function ensureAta(
  payer: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  tx: Transaction,
) {
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

export async function buyOnCurve(userId: string, slug: string, sol: number) {
  if (sol <= 0 || sol > 50) throw new Error("Buy size must be between 0 and 50 SOL.");
  const story = await loadStory(slug);
  if (story.venue === "nft") throw new Error("NFTs do not trade on the curve.");
  if (story.status !== "live" && story.status !== "graduated") throw new Error("This launch is not trading.");

  const quoteIn = BigInt(Math.round(sol * 1_000_000_000));
  const fees = splitBuyFees(
    quoteIn,
    Number(story.author_bps),
    Number(story.protocol_bps),
    snipeBps(story),
  );
  const quoteReserve = BigInt(story.curve_quote_lamports);
  const tokenReserve = BigInt(story.curve_token_raw);
  const tokensOut = tokensOutForBuy(quoteReserve, tokenReserve, fees.toCurve);
  if (tokensOut <= 0n) throw new Error("Curve would return zero tokens.");

  const user = await loadUserKeypair(userId);
  const curve = await loadCurve(story.id);
  const protocol = protocolKeypair();
  const mint = new PublicKey(story.token_address);
  const connection = solanaConnection();

  const tx = new Transaction();
  const userAta = await ensureAta(user.publicKey, user.publicKey, mint, tx);
  const curveAta = getAssociatedTokenAddressSync(mint, curve.publicKey, false, TOKEN_PROGRAM_ID);

  const vaultCut = story.engine === "onceuponers" ? fees.author : 0n;
  const authorCut = story.engine === "author" ? fees.author : 0n;

  tx.add(
    SystemProgram.transfer({
      fromPubkey: user.publicKey,
      toPubkey: curve.publicKey,
      lamports: Number(fees.toCurve + vaultCut),
    }),
  );
  if (authorCut > 0n) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: user.publicKey,
        toPubkey: new PublicKey(story.author_wallet),
        lamports: Number(authorCut),
      }),
    );
  }
  if (fees.protocol + fees.snipe > 0n) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: user.publicKey,
        toPubkey: protocol.publicKey,
        lamports: Number(fees.protocol + fees.snipe),
      }),
    );
  }
  tx.add(createTransferInstruction(curveAta, userAta, curve.publicKey, tokensOut, [], TOKEN_PROGRAM_ID));

  const signature = await sendAndConfirmTransaction(connection, tx, [user, curve], {
    commitment: "confirmed",
  });

  const nextQuote = quoteReserve + fees.toCurve;
  const nextTokens = tokenReserve - tokensOut;
  let rewardVault = BigInt(story.reward_vault_lamports);
  if (story.engine === "onceuponers") {
    rewardVault += fees.author;
  }

  const service = createServiceClient();
  const graduated = nextQuote >= graduationLamports();
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
    trader: user.publicKey.toBase58(),
    side: "buy",
    token_in: "SOL",
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
      swapper: user.publicKey.toBase58(),
      asset: "SOL",
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
  };
}

export async function sellOnCurve(userId: string, slug: string, tokenUi: number, decimals: number) {
  if (tokenUi <= 0) throw new Error("Sell size must be positive.");
  const story = await loadStory(slug);
  if (story.venue === "nft") throw new Error("NFTs do not trade on the curve.");

  const tokensIn = BigInt(Math.round(tokenUi * 10 ** decimals));
  const quoteReserve = BigInt(story.curve_quote_lamports);
  const tokenReserve = BigInt(story.curve_token_raw);
  const quoteOut = quoteOutForSell(quoteReserve, tokenReserve, tokensIn);
  const fees = splitBuyFees(quoteOut, Number(story.author_bps), Number(story.protocol_bps), 0);
  const userGets = fees.toCurve;
  if (userGets <= 0n) throw new Error("Curve would return zero SOL.");

  const user = await loadUserKeypair(userId);
  const curve = await loadCurve(story.id);
  const protocol = protocolKeypair();
  const mint = new PublicKey(story.token_address);
  const connection = solanaConnection();
  const userAta = getAssociatedTokenAddressSync(mint, user.publicKey, false, TOKEN_PROGRAM_ID);
  const curveAta = getAssociatedTokenAddressSync(mint, curve.publicKey, false, TOKEN_PROGRAM_ID);

  const held = await getAccount(connection, userAta);
  if (held.amount < tokensIn) throw new Error("Not enough tokens.");

  const tx = new Transaction().add(
    createTransferInstruction(userAta, curveAta, user.publicKey, tokensIn, [], TOKEN_PROGRAM_ID),
    SystemProgram.transfer({
      fromPubkey: curve.publicKey,
      toPubkey: user.publicKey,
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

  const signature = await sendAndConfirmTransaction(connection, tx, [user, curve], {
    commitment: "confirmed",
  });

  const service = createServiceClient();
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
    trader: user.publicKey.toBase58(),
    side: "sell",
    token_in: story.token_address,
    token_out: "SOL",
    amount_in: tokensIn.toString(),
    amount_out: userGets.toString(),
  });

  return { signature, explorer: explorerTx(signature), solOut: Number(userGets) / 1_000_000_000 };
}

export async function claimPiece(userId: string, slug: string) {
  const story = await loadStory(slug);
  if (story.engine !== "onceuponers") throw new Error("Author launches push fees. There is nothing to claim.");
  const reward = BigInt(story.reward_vault_lamports);
  if (reward <= 0n) throw new Error("The vault is empty.");

  const user = await loadUserKeypair(userId);
  const curve = await loadCurve(story.id);
  const mint = new PublicKey(story.token_address);
  const connection = solanaConnection();
  const userAta = getAssociatedTokenAddressSync(mint, user.publicKey, false, TOKEN_PROGRAM_ID);
  const held = await getAccount(connection, userAta).catch(() => null);
  const supply = BigInt(story.curve_token_raw) + (held?.amount ?? 0n);
  if (!held || held.amount === 0n || supply === 0n) throw new Error("You need to hold the token to claim The Piece.");

  const share = (reward * held.amount) / (held.amount + BigInt(story.curve_token_raw));
  if (share <= 0n) throw new Error("Your share rounds to zero.");

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: curve.publicKey,
      toPubkey: user.publicKey,
      lamports: Number(share),
    }),
  );
  const signature = await sendAndConfirmTransaction(connection, tx, [curve], { commitment: "confirmed" });

  const service = createServiceClient();
  await service
    .from("stories")
    .update({ reward_vault_lamports: (reward - share).toString() })
    .eq("id", story.id);
  await service.from("piece_claims").insert({
    story_id: story.id,
    user_id: userId,
    wallet: user.publicKey.toBase58(),
    tx_hash: signature,
    asset: "SOL",
    amount: share.toString(),
  });

  return { signature, explorer: explorerTx(signature), sol: Number(share) / 1_000_000_000 };
}
