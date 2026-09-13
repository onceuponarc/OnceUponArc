import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { bindingKindForDex, catalogByCaip2, type DexId } from "@onceupon/config/pools";

export async function POST(request: Request) {
  const { user } = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  }

  const body = (await request.json()) as {
    storySlug?: string;
    chainCaip2?: string;
    poolAddress?: string;
    mechanism?: string;
    proofUrl?: string;
    kind?: string;
    depthUsd?: number;
    quoteAddress?: string | null;
  };

  if (!body.storySlug || !body.chainCaip2 || !body.poolAddress) {
    return NextResponse.json({ error: "Story, chain, and pool are required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: story } = await supabase
    .from("stories")
    .select("id, author_user_id, pair_class, rwa_issuer, token_address")
    .eq("slug", body.storySlug)
    .maybeSingle();

  if (!story || story.author_user_id !== user.id) {
    return NextResponse.json({ error: "Only the Author can bind a foreign pool." }, { status: 403 });
  }

  if (story.pair_class === "rwa_equity") {
    const { data: issuer } = await supabase
      .from("rwa_issuers")
      .select("id")
      .eq("name", story.rwa_issuer ?? "")
      .eq("allowed", true)
      .maybeSingle();
    if (!issuer) {
      return NextResponse.json(
        { error: "Tokenized equity pairs require a licensed issuer on the allowlist." },
        { status: 400 },
      );
    }
  }

  const catalog = catalogByCaip2(body.chainCaip2);
  const dex = (body.mechanism as DexId) || "custom";
  const { data, error } = await supabase
    .from("bindings")
    .insert({
      story_id: story.id,
      kind: body.kind ?? bindingKindForDex(dex),
      is_primary: false,
      chain_caip2: body.chainCaip2,
      pool_address: body.poolAddress,
      quote_address: body.quoteAddress ?? null,
      dest_token_mint: story.token_address,
      mechanism: body.mechanism ?? "other",
      proof_url: body.proofUrl || null,
      depth_usd: body.depthUsd ?? null,
      fee_routing: catalog?.id === "solana" ? "jupiter" : "foreign_pool",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
