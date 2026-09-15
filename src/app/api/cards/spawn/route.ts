import { NextResponse } from "next/server";
import { Keypair, Transaction } from "@solana/web3.js";
import { getSessionUser } from "@/lib/auth";
import { fetchTweet } from "@/lib/cards/tweet";
import { slugifyCard, writeCard, getCard, logActivity } from "@/lib/cards/store";
import { CARD_FLYWHEELS, type CardFlywheel, type PressCard } from "@/lib/cards/types";
import { buildMintPressCardIx } from "@/lib/press/nft";
import { deskSolanaKey } from "@/lib/wallets/sign-desk";
import { sendSignedTx, waitForTx, explorerFromSig } from "@/lib/solana/partial-tx";
import { fetchLatestBlockhash } from "@/lib/solana/blockhash";
import { serverSolanaRpcs } from "@/lib/solana/rpc-urls";
import { PUBLIC_SITE_URL } from "@onceupon/config/urls";

export const dynamic = "force-dynamic";

const FLY = new Set(CARD_FLYWHEELS.map((row) => row.id));

export async function POST(request: Request) {
  try {
  const { user, profile } = await getSessionUser();
  if (!profile || !user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  const body = (await request.json()) as {
    url?: string;
    title?: string;
    ticker?: string;
    startPriceUi?: number;
    startMcapUi?: number;
    flywheel?: string;
    creatorPayAddress?: string;
    payNetwork?: "arc" | "solana";
    storySlug?: string | null;
    coverUrl?: string | null;
    blurb?: string;
  };

  const startPriceUi = Number(body.startPriceUi ?? 5);
  const startMcapUi = Number(body.startMcapUi ?? 25_000);
  if (!Number.isFinite(startPriceUi) || startPriceUi <= 0) {
    return NextResponse.json({ error: "Start price must be above zero." }, { status: 400 });
  }
  if (!Number.isFinite(startMcapUi) || startMcapUi < 1000) {
    return NextResponse.json({ error: "Start MC must be at least 1,000." }, { status: 400 });
  }
  const flywheel = (FLY.has((body.flywheel ?? "creator") as CardFlywheel)
    ? body.flywheel
    : "creator") as CardFlywheel;

  const tweet = body.url ? await fetchTweet(body.url) : null;
  const ticker = (body.ticker || tweet?.handle || "CARD").replace(/[^A-Za-z0-9]/g, "").slice(0, 12).toUpperCase();
  const title = (body.title || tweet?.name || ticker).slice(0, 48);
  const pay = (body.creatorPayAddress ?? "").trim();
  if (!pay) return NextResponse.json({ error: "Paste the USDC wallet that receives card buys." }, { status: 400 });

  const card: PressCard = {
    id: crypto.randomUUID(),
    slug: slugifyCard(ticker),
    title,
    ticker,
    blurb: (body.blurb || tweet?.text || `${title} press card.`).slice(0, 280),
    tweetUrl: tweet?.tweetUrl ?? body.url ?? null,
    tweetId: tweet?.tweetId ?? null,
    tweetHandle: tweet?.handle ?? null,
    coverUrl: body.coverUrl || tweet?.coverUrl || null,
    startPriceUi,
    startMcapUi,
    flywheel,
    storySlug: body.storySlug || null,
    creatorHandle: profile.handle,
    creatorPayAddress: pay,
    payNetwork: body.payNetwork === "solana" ? "solana" : "arc",
    ownerHandle: profile.handle,
    listed: true,
    lastPayTx: null,
    createdAt: new Date().toISOString(),
    nftMint: null,
    pressNumber: null,
    rarity: "common",
    editionIndex: 1,
    editionTotal: 1,
  };
  await writeCard(card);
  const saved = (await getCard(card.slug)) ?? card;

  // Mint a real, transferable Metaplex Core NFT for the card. This is a
  // separate step from the DB write above on purpose: if minting fails, the
  // card still exists and is usable (matches "never lose state that already
  // succeeded" — the creator can retry the mint rather than losing the card).
  let nftMint: string | null = null;
  let mintError: string | null = null;
  let mintSignature: string | null = null;
  try {
    const creatorKey = await deskSolanaKey(user.id);
    const assetKeypair = Keypair.generate();
    const ixs = await buildMintPressCardIx({
      assetKeypair,
      payer: creatorKey,
      owner: creatorKey.publicKey,
      name: `${title} ${saved.ticker}`,
      uri: `${PUBLIC_SITE_URL}/api/cards/${card.slug}/nft-metadata`,
    });
    const tx = new Transaction().add(...ixs);
    const latest = await fetchLatestBlockhash(serverSolanaRpcs());
    tx.feePayer = creatorKey.publicKey;
    tx.recentBlockhash = latest.blockhash;
    tx.sign(assetKeypair, creatorKey);
    mintSignature = await sendSignedTx(tx.serialize().toString("base64"));
    await waitForTx(mintSignature);
    nftMint = assetKeypair.publicKey.toBase58();
    await writeCard({ ...saved, nftMint });
    await logActivity({
      cardSlug: card.slug,
      kind: "minted",
      detail: { owner: profile.handle, nftMint },
      txSignature: mintSignature,
    });
  } catch (error) {
    mintError = error instanceof Error ? error.message : "NFT mint failed.";
  }

  return NextResponse.json({
    slug: card.slug,
    card: { ...saved, nftMint },
    nft: nftMint ? { mint: nftMint, signature: mintSignature, explorer: explorerFromSig(mintSignature!) } : null,
    mintError,
  });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not print the card." },
      { status: 400 },
    );
  }
}
