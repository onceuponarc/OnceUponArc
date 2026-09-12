import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { launchOnSolana, parseMint } from "@/lib/solana/launch";
import { redactWalletError } from "@/lib/crypto/secret-box";
import { RWA_GATE } from "@onceupon/config/copy";
import type { LaunchVenue, QuoteKind } from "@onceupon/config/solana";
import { SOLANA } from "@onceupon/config/solana";

export const maxDuration = 60;

const VENUES: LaunchVenue[] = ["spl", "nft", "pumpfun", "pons"];
const QUOTES: QuoteKind[] = ["sol", "usdc", "meme", "stock", "custom"];

export async function POST(request: Request) {
  const { user, profile } = await getSessionUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  }

  const body = (await request.json()) as {
    chain?: string;
    venue?: LaunchVenue;
    engine?: "author" | "onceuponers";
    title?: string;
    ticker?: string;
    blurb?: string;
    authorBps?: number;
    snipeTaxBps?: number;
    quoteKind?: QuoteKind;
    quoteMint?: string;
    pairLabel?: string;
    rewardMint?: string;
    autoBuyRewards?: boolean;
    nftSupply?: number;
    rightsAttested?: boolean;
  };

  if (body.chain === "arc") {
    return NextResponse.json(
      {
        error:
          "Arc testnet is live for wallets and quotes. The token factory is not deployed yet. Launch on Solana mainnet.",
      },
      { status: 400 },
    );
  }
  if (body.chain && body.chain !== "solana") {
    return NextResponse.json(
      { error: "That chain is coming soon. Launch on Solana mainnet today." },
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

  const quoteKind: QuoteKind = QUOTES.includes(body.quoteKind ?? "sol") ? (body.quoteKind ?? "sol") : "sol";
  const quoteMint = parseMint(body.quoteMint ?? (quoteKind === "usdc" ? SOLANA.usdcMint : null));
  if ((quoteKind === "meme" || quoteKind === "custom") && !quoteMint) {
    return NextResponse.json({ error: "Paste a Solana mint address to pair with." }, { status: 400 });
  }
  if (quoteKind === "stock" && !quoteMint) {
    return NextResponse.json({ error: RWA_GATE }, { status: 400 });
  }

  try {
    const result = await launchOnSolana({
      userId: user.id,
      handle: profile.handle,
      title: body.title,
      ticker: body.ticker,
      blurb: body.blurb ?? "",
      engine: body.engine,
      venue: body.venue,
      authorBps: Number(body.authorBps ?? 100),
      snipeTaxBps: Number(body.snipeTaxBps ?? 0),
      quoteKind,
      quoteMint: quoteMint?.toBase58() ?? null,
      pairLabel: body.pairLabel ?? (quoteKind === "sol" ? "SOL" : body.ticker),
      rewardMint: parseMint(body.rewardMint ?? body.quoteMint ?? null)?.toBase58() ?? null,
      autoBuyRewards: Boolean(body.autoBuyRewards),
      nftSupply: Number(body.nftSupply ?? 1),
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
  }
}
