import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PROTOCOL, ARC_TESTNET } from "@onceupon/config/arc";

export async function POST(request: Request) {
  const { user } = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: wallet } = await supabase
    .from("user_wallets")
    .select("address, verified_at")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  if (!wallet?.verified_at) {
    return NextResponse.json({ error: "Launch without a verified wallet is rejected." }, { status: 403 });
  }
  const age = Date.now() - new Date(wallet.verified_at).getTime();
  if (age > 24 * 60 * 60 * 1000) {
    return NextResponse.json({ error: "Wallet signature is older than 24 hours. Sign again." }, { status: 403 });
  }

  const body = (await request.json()) as { slug?: string };
  const { data: story } = await supabase
    .from("stories")
    .select("*")
    .eq("slug", body.slug)
    .eq("author_user_id", user.id)
    .maybeSingle();

  if (!story) {
    return NextResponse.json({ error: "Unknown draft." }, { status: 404 });
  }

  if (!ARC_TESTNET.factory) {
    return NextResponse.json({
      ready: false,
      reason: "StoryFactory is not deployed on 5042002 yet (Phase 1).",
      intendedCall: {
        chainId: ARC_TESTNET.chainId,
        factory: ARC_TESTNET.factory,
        engine: story.engine === "author" ? 0 : 1,
        authorBps: story.author_bps,
        protocolBps: story.protocol_bps ?? PROTOCOL.protocolBpsDefault,
        quote: ARC_TESTNET.usdcErc20,
        feeRecipient: wallet.address,
        ticker: story.ticker,
      },
    });
  }

  return NextResponse.json({
    ready: true,
    reason: "ChapterFactory is live on Arc Testnet.",
    intendedCall: {
      chainId: ARC_TESTNET.chainId,
      factory: ARC_TESTNET.factory,
      engine: story.engine === "author" ? 0 : 1,
      authorBps: story.author_bps,
      protocolBps: story.protocol_bps ?? PROTOCOL.protocolBpsDefault,
      quote: ARC_TESTNET.usdcErc20,
      feeRecipient: wallet.address,
      ticker: story.ticker,
    },
  });
}
