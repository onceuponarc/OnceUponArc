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

export const maxDuration = 60;

const VENUES: LaunchVenue[] = ["spl", "nft", "pumpfun", "pons"];

async function resolveQuote(body: {
  quoteId?: string;
  quoteKind?: string;
  quoteMint?: string;
}): Promise<QuoteAsset> {
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
  const { user, profile } = await getSessionUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  }

  const body = (await request.json()) as {
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
    rightsAttested?: boolean;
    payer?: string;
  };

  if (body.confirm) {
    if (!body.slug || !body.signature) {
      return NextResponse.json({ error: "Launch confirmation needs a slug and signature." }, { status: 400 });
    }
    try {
      const result = await confirmLaunch(user.id, body.slug, body.signature);
      return NextResponse.json(result);
    } catch (error) {
      return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
    }
  }

  const chain = body.chain ?? "arc";
  if (!isPrintableChain(chain)) {
    return NextResponse.json({ error: "Unknown chain. Pick Arc, Solana, Ethereum, Base, or Robinhood Chain." }, { status: 400 });
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

  try {
    const payer = await assertPayer(user.id, body.payer);
    let quote = await resolveQuote(body);
    if (quote.mint) {
      const live = await inspectMint(quote.mint);
      if (live.decimals !== quote.decimals) {
        quote = { ...quote, decimals: live.decimals };
      }
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
      authorBps: Number(body.authorBps ?? 100),
      snipeTaxBps: Number(body.snipeTaxBps ?? 0),
      quote,
      rewardMint: parseMint(body.rewardMint ?? quote.mint ?? null)?.toBase58() ?? null,
      autoBuyRewards: Boolean(body.autoBuyRewards),
      nftSupply: Number(body.nftSupply ?? 1),
      payer: payer.toBase58(),
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
  }
}
