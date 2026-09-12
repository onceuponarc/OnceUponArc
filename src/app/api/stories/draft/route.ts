import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PROTOCOL, ARC_TESTNET } from "@onceupon/config/arc";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

export async function POST(request: Request) {
  const { user, profile } = await getSessionUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  }

  const body = (await request.json()) as {
    title?: string;
    ticker?: string;
    blurb?: string;
    engine?: "author" | "onceuponers";
    authorBps?: number;
    pairClass?: string;
    pairLabel?: string;
    rightsAttested?: boolean;
  };

  if (!body.title || !body.ticker || !body.engine) {
    return NextResponse.json({ error: "Title, ticker, and engine are required." }, { status: 400 });
  }
  if (!body.rightsAttested) {
    return NextResponse.json({ error: "Authors must attest they have the rights to the art and name." }, { status: 400 });
  }

  const cap =
    body.engine === "author" ? PROTOCOL.authorModeAuthorBpsCap : PROTOCOL.onceuponersAuthorBpsCap;
  const authorBps = Math.min(Math.max(0, Number(body.authorBps ?? 0)), cap);
  const slugBase = slugify(body.title) || slugify(body.ticker) || "story";
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;

  const supabase = await createClient();
  const { data: wallet } = await supabase
    .from("user_wallets")
    .select("address")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .maybeSingle();

  const { data, error } = await supabase
    .from("stories")
    .insert({
      slug,
      title: body.title.trim(),
      ticker: body.ticker.trim().toUpperCase(),
      blurb: body.blurb?.trim() ?? "",
      author_user_id: user.id,
      author_wallet: wallet?.address ?? "unverified",
      engine: body.engine,
      status: "draft",
      author_bps: authorBps,
      protocol_bps: PROTOCOL.protocolBpsDefault,
      quote_address: ARC_TESTNET.usdcErc20,
      pair_class: body.pairClass === "eurc" ? "eurc" : "usdc",
      pair_label: body.pairLabel ?? "USDC",
      supply: PROTOCOL.defaultSupply.toString(),
      decimals: PROTOCOL.defaultDecimals,
      rights_attested: true,
    })
    .select("id, slug")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
