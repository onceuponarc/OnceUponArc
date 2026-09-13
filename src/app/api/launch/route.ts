import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { confirmLaunch, launchOnSolana, parseMint } from "@/lib/solana/launch";
import { inspectMint } from "@/lib/solana/mint";
import { redactWalletError } from "@/lib/crypto/secret-box";
import { isPrintableChain, type LaunchVenue } from "@onceupon/config/solana";
import {
  customQuoteAsset,
  findQuote,
  findQuoteByMint,
  type QuoteAsset,
} from "@onceupon/config/quotes";
import { assertPayer } from "@/lib/wallets/bound";
import { parseLinkedPool } from "@/lib/pools/resolve";
import { cleanTelegram, cleanTwitter, cleanWebsite } from "@/lib/media/socials";
import { coverFromPaste } from "@/lib/media/cover";
import { feesForVenue } from "@onceupon/config/launchpad";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VENUES: LaunchVenue[] = ["spl", "nft", "pumpfun", "pons"];

type LaunchBody = {
  confirm?: boolean;
  slug?: string;
  signature?: string;
  chain?: string;
  venue?: LaunchVenue;
  engine?: "author" | "onceuponers";
  title?: string;
  ticker?: string;
  blurb?: string;
  authorBps?: number;
  snipeTaxBps?: number;
  quoteId?: string;
  quoteKind?: string;
  quoteMint?: string;
  rewardMint?: string;
  autoBuyRewards?: boolean;
  nftSupply?: number;
  supplyUi?: number;
  decimals?: number;
  graduationUi?: number;
  virtualUi?: number;
  rightsAttested?: boolean;
  payer?: string;
  recentBlockhash?: string;
  poolAddress?: string;
  poolDex?: string;
  poolLabel?: string;
  poolUrl?: string;
  poolChain?: string;
  poolDepthUsd?: number;
  poolQuoteAddress?: string;
  coverUrl?: string;
  imageUri?: string;
  twitterUrl?: string;
  telegramUrl?: string;
  websiteUrl?: string;
};

async function resolveQuote(body: LaunchBody): Promise<QuoteAsset> {
  if (body.quoteId && body.quoteId !== "custom") {
    const listed = findQuote(body.quoteId);
    if (!listed) throw new Error("Unknown quote. Pick SOL, a listed mint, or paste a mint.");
    return listed;
  }
  if (body.quoteKind === "sol" && !body.quoteMint) return findQuote("sol")!;
  if (body.quoteKind === "usdc" && !body.quoteMint) return findQuote("usdc")!;

  const mint = parseMint(body.quoteMint ?? null);
  if (!mint) throw new Error("Paste a Solana mint address to pair with.");
  const byMint = findQuoteByMint(mint.toBase58());
  if (byMint) return byMint;
  const meta = await inspectMint(mint);
  return customQuoteAsset(mint.toBase58(), meta.decimals);
}

export async function POST(request: Request) {
  try {
    const { user, profile } = await getSessionUser();
    if (!user || !profile) {
      return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    }

    let body: LaunchBody;
    try {
      body = (await request.json()) as LaunchBody;
    } catch {
      return NextResponse.json({ error: "Launch request was empty. Retry." }, { status: 400 });
    }

    if (body.confirm) {
      if (!body.slug || !body.signature) {
        return NextResponse.json({ error: "Launch confirmation needs a slug and signature." }, { status: 400 });
      }
      const result = await confirmLaunch(user.id, body.slug, body.signature);
      return NextResponse.json(result);
    }

    const chain = body.chain ?? "arc";
    if (!isPrintableChain(chain)) {
      return NextResponse.json(
        { error: "Unknown chain. Pick Arc, Solana, or Robinhood Chain." },
        { status: 400 },
      );
    }
    if (!body.title || !body.ticker || !body.engine || !body.venue) {
      return NextResponse.json({ error: "Name, ticker, engine, and venue are required." }, { status: 400 });
    }
    if (!VENUES.includes(body.venue) || !["author", "onceuponers"].includes(body.engine)) {
      return NextResponse.json({ error: "Unknown launch type." }, { status: 400 });
    }
    if (!body.rightsAttested) {
      return NextResponse.json({ error: "Attest you have the rights to the art and name." }, { status: 400 });
    }

    const payer = await assertPayer(user.id, body.payer);
    const quote = await resolveQuote(body);
    const venueFees = feesForVenue(body.venue, body.engine);
    const coverPasted = body.coverUrl ? coverFromPaste(body.coverUrl) : null;
    if (body.venue === "pumpfun" && !(body.coverUrl ?? "").trim()) {
      return NextResponse.json(
        { error: "Pump.fun-style launches need coin art. Upload an image or paste an IPFS CID." },
        { status: 400 },
      );
    }
    const result = await launchOnSolana({
      userId: user.id,
      handle: profile.handle,
      chain,
      title: body.title,
      ticker: body.ticker,
      blurb: body.blurb ?? "",
      engine: body.engine,
      venue: body.venue,
      authorBps: Number(body.authorBps ?? venueFees.authorBps),
      snipeTaxBps: Number(body.snipeTaxBps ?? venueFees.snipeTaxBps),
      quote,
      rewardMint: parseMint(body.rewardMint ?? quote.mint ?? null)?.toBase58() ?? null,
      autoBuyRewards: false,
      nftSupply: Number(body.nftSupply ?? 1),
      supplyUi: body.supplyUi == null ? undefined : Number(body.supplyUi),
      decimals: body.decimals == null ? undefined : Number(body.decimals),
      graduationUi: body.graduationUi == null ? undefined : Number(body.graduationUi),
      virtualUi: body.virtualUi == null ? undefined : Number(body.virtualUi),
      payer: payer.toBase58(),
      recentBlockhash: body.recentBlockhash,
      linkedPool: parseLinkedPool({
        poolAddress: body.poolAddress,
        poolDex: body.poolDex,
        poolLabel: body.poolLabel,
        poolUrl: body.poolUrl,
        poolChain: body.poolChain,
        poolDepthUsd: body.poolDepthUsd,
        quoteAddress: body.poolQuoteAddress ?? quote.mint ?? null,
      }),
      coverUrl: coverPasted?.url ?? body.coverUrl ?? null,
      imageUri: body.imageUri ?? coverPasted?.imageUri ?? body.coverUrl ?? null,
      twitterUrl: body.twitterUrl ? cleanTwitter(body.twitterUrl) : null,
      telegramUrl: body.telegramUrl ? cleanTelegram(body.telegramUrl) : null,
      websiteUrl: body.websiteUrl ? cleanWebsite(body.websiteUrl) : null,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("launch route failed", error);
    return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
  }
}
