import { NextResponse } from "next/server";
import { Keypair, VersionedTransaction } from "@solana/web3.js";
import { getSessionUser } from "@/lib/auth";
import { generateVanityMint, VANITY_SUFFIX } from "@/lib/solana/vanity";
import { pumpBuyTx } from "@/lib/solana/pumpportal";
import { buildCreateV2Tx, parseQuoteMintChoice, type PoolPairChoice } from "@/lib/solana/pump-sdk";
import { sendSignedTx, waitForTx, explorerFromSig } from "@/lib/solana/partial-tx";
import { fetchLatestBlockhash } from "@/lib/solana/blockhash";
import { serverSolanaRpcs } from "@/lib/solana/rpc-urls";
import { deskSolanaKey } from "@/lib/wallets/sign-desk";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_SITE_URL } from "@onceupon/config/urls";
import { PAD_NAME } from "@onceupon/config/launchpad";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function normalizeUrl(raw: string | undefined, kind: "website" | "twitter" | "telegram") {
  const value = (raw ?? "").trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (kind === "twitter") return `https://x.com/${value.replace(/^@/, "")}`;
  if (kind === "telegram") return `https://t.me/${value.replace(/^@/, "")}`;
  return `https://${value}`;
}

export async function POST(request: Request) {
  try {
    const { user, profile } = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const body = (await request.json()) as {
      name?: string;
      symbol?: string;
      blurb?: string;
      website?: string;
      twitter?: string;
      telegram?: string;
      metadataUri?: string;
      coverUrl?: string;
      devBuySol?: number;
      vanity?: boolean;
      poolPair?: PoolPairChoice;
      customQuoteMint?: string;
      mayhemMode?: boolean;
      rewardsTo?: "creator" | "holders";
      creatorFeeBps?: number;
    };
    const name = (body.name ?? "").trim();
    const symbol = (body.symbol ?? "").trim().toUpperCase().slice(0, 10);
    if (!name || !symbol) return NextResponse.json({ error: "Name and ticker required." }, { status: 400 });

    const poolPair: PoolPairChoice = body.poolPair === "usdc" || body.poolPair === "custom" ? body.poolPair : "sol";
    const quoteMint = parseQuoteMintChoice(poolPair, body.customQuoteMint);
    const mayhemMode = Boolean(body.mayhemMode);
    const holderReward = body.rewardsTo === "holders";
    const requestedFeeBps = Math.max(0, Math.min(300, Math.round(Number(body.creatorFeeBps ?? 0))));

    const payer = await deskSolanaKey(user.id);
    const minted =
      body.vanity === false
        ? { keypair: Keypair.generate(), tries: 1, vanity: false }
        : generateVanityMint(VANITY_SUFFIX);
    const mintAddress = minted.keypair.publicKey.toBase58();
    const metadataUri =
      body.metadataUri || `${PUBLIC_SITE_URL}/api/token/${mintAddress}/metadata`;

    const blurb = (body.blurb ?? "").trim();
    const websiteUrl = normalizeUrl(body.website, "website");
    const twitterUrl = normalizeUrl(body.twitter, "twitter");
    const telegramUrl = normalizeUrl(body.telegram, "telegram");

    // Persist the story record before minting so metadataUri (fetched by pump.fun's
    // indexer after the tx lands) already resolves to the real name/description/links
    // instead of falling back to generic branding.
    try {
      const supabase = await createClient();
      const slug = `${slugify(name) || slugify(symbol) || "token"}-${Math.random().toString(36).slice(2, 6)}`;
      await supabase.from("stories").insert({
        slug,
        title: name,
        ticker: symbol,
        blurb,
        cover_url: body.coverUrl ?? null,
        image_uri: body.coverUrl ?? null,
        website_url: websiteUrl,
        twitter_url: twitterUrl,
        telegram_url: telegramUrl,
        author_user_id: user.id,
        author_wallet: payer.publicKey.toBase58(),
        engine: holderReward ? "onceuponers" : "author",
        status: "live",
        author_bps: requestedFeeBps,
        chain: "solana",
        venue: "pumpfun",
        pair_class: poolPair === "usdc" ? "usdc" : poolPair === "custom" ? "other" : "sol",
        pair_label: poolPair === "usdc" ? "USDC" : poolPair === "custom" ? "Custom" : "SOL",
        mint_decimals: 6,
        quote_mint: quoteMint ? quoteMint.toBase58() : null,
        token_address: mintAddress,
      });
    } catch {
      // Don't block a successful on-chain launch on a DB write failure.
    }

    const built = await buildCreateV2Tx({
      mint: minted.keypair.publicKey,
      name,
      symbol,
      uri: metadataUri,
      payer: payer.publicKey,
      mayhemMode,
      holderReward,
      creatorFeeBps: requestedFeeBps,
      quoteMint,
    });

    const latest = await fetchLatestBlockhash(serverSolanaRpcs());
    built.tx.feePayer = payer.publicKey;
    built.tx.recentBlockhash = latest.blockhash;
    built.tx.sign(minted.keypair, payer);
    const raw = built.tx.serialize();
    const signature = await sendSignedTx(raw.toString("base64"));
    await waitForTx(signature).catch(() => undefined);

    // Optional dev buy: only wired up for SOL-paired coins for now. A separate,
    // simple PumpPortal buy after the create has landed — keeps the risky custom
    // fee-math for token-quoted buys out of this pass.
    let devBuySignature: string | null = null;
    const devBuySol = Number(body.devBuySol ?? 0);
    if (devBuySol > 0 && poolPair === "sol") {
      try {
        const buyBase64 = await pumpBuyTx({
          publicKey: payer.publicKey.toBase58(),
          mint: mintAddress,
          solAmount: devBuySol,
        });
        const buyTx = VersionedTransaction.deserialize(Buffer.from(buyBase64, "base64"));
        buyTx.sign([payer]);
        devBuySignature = await sendSignedTx(Buffer.from(buyTx.serialize()).toString("base64"));
        await waitForTx(devBuySignature).catch(() => undefined);
      } catch {
        // Coin is live either way; the dev buy is a nice-to-have.
      }
    }

    return NextResponse.json({
      mint: mintAddress,
      signature,
      devBuySignature,
      explorer: explorerFromSig(signature),
      creator: payer.publicKey.toBase58(),
      vanity: minted.vanity,
      suffix: VANITY_SUFFIX,
      tries: minted.tries,
      poolPair,
      quoteMint: quoteMint ? quoteMint.toBase58() : null,
      mayhemMode,
      holderReward,
      appliedCreatorFeeBps: built.appliedCreatorFeeBps,
      metadata: {
        name,
        symbol,
        description: blurb || `${name} launched on ${PAD_NAME}.`,
        image: body.coverUrl,
        createdOn: PUBLIC_SITE_URL,
        launchpad: PAD_NAME,
        creatorX: profile?.handle ? `@${profile.handle}` : "",
        website: websiteUrl ?? undefined,
        twitter: twitterUrl ?? undefined,
        telegram: telegramUrl ?? undefined,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not launch on Solana." },
      { status: 400 },
    );
  }
}
