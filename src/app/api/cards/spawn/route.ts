import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { fetchTweet } from "@/lib/cards/tweet";
import { slugifyCard, writeCard } from "@/lib/cards/store";
import { CARD_FLYWHEELS, type CardFlywheel, type PressCard } from "@/lib/cards/types";

export const dynamic = "force-dynamic";

const FLY = new Set(CARD_FLYWHEELS.map((row) => row.id));

export async function POST(request: Request) {
  const { profile } = await getSessionUser();
  if (!profile) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
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

  let tweet = body.url ? await fetchTweet(body.url) : null;
  const ticker = (body.ticker || tweet?.handle || "CARD").replace(/[^A-Za-z0-9]/g, "").slice(0, 12).toUpperCase();
  const title = (body.title || tweet?.name || ticker).slice(0, 48);
  const pay = (body.creatorPayAddress ?? "").trim();
  if (!pay) return NextResponse.json({ error: "Paste the USDC wallet that receives card buys." }, { status: 400 });

  const card: PressCard = {
    id: crypto.randomUUID(),
    slug: slugifyCard(ticker),
    title,
    ticker,
    blurb: tweet?.text?.slice(0, 280) || `${title} press card.`,
    tweetUrl: tweet?.tweetUrl ?? body.url ?? null,
    tweetId: tweet?.tweetId ?? null,
    tweetHandle: tweet?.handle ?? null,
    coverUrl: tweet?.coverUrl ?? null,
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
  };
  writeCard(card);
  return NextResponse.json({ slug: card.slug, card });
}
