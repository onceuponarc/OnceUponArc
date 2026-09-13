import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import {
  ALLOWED_QUOTE_ISSUERS,
  bindingKindForDex,
  catalogByCaip2,
  type DexId,
} from "@onceupon/config/pools";
import { redactWalletError } from "@/lib/crypto/secret-box";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { user } = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  }

  let body: {
    storySlug?: string;
    chainCaip2?: string;
    poolAddress?: string;
    mechanism?: string;
    proofUrl?: string;
    kind?: string;
    depthUsd?: number;
    quoteAddress?: string | null;
    label?: string;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Bind request was empty." }, { status: 400 });
  }

  if (!body.storySlug || !body.chainCaip2 || !body.poolAddress) {
    return NextResponse.json({ error: "Story, chain, and pool are required." }, { status: 400 });
  }

  try {
    const service = createServiceClient();
    const { data: story } = await service
      .from("stories")
      .select("id, author_user_id, pair_class, rwa_issuer, token_address, pair_label")
      .eq("slug", body.storySlug)
      .maybeSingle();

    if (!story || story.author_user_id !== user.id) {
      return NextResponse.json({ error: "Only the Author can bind a pool." }, { status: 403 });
    }

    if (story.pair_class === "rwa_equity") {
      const issuer = story.rwa_issuer ?? "";
      if (issuer && !(ALLOWED_QUOTE_ISSUERS as readonly string[]).includes(issuer)) {
        return NextResponse.json(
          { error: "That tokenized quote is not on the issuer allowlist. Pairing is a quote, not studio equity." },
          { status: 400 },
        );
      }
    }

    const catalog = catalogByCaip2(body.chainCaip2);
    const dex = (body.mechanism as DexId) || "custom";
    const label = body.label?.trim() || `${dex} pool`;
    const { data, error } = await service
      .from("bindings")
      .upsert(
        {
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
          verified_at: new Date().toISOString(),
        },
        { onConflict: "story_id,chain_caip2,pool_address" },
      )
      .select("id, pool_address")
      .single();

    if (error) {
      if (error.code === "23505") {
        await service
          .from("stories")
          .update({
            linked_pool_address: body.poolAddress,
            linked_pool_dex: dex,
            linked_pool_label: label,
          })
          .eq("id", story.id);
        return NextResponse.json({
          id: null,
          poolAddress: body.poolAddress,
          label,
          pairLabel: story.pair_label,
          already: true,
        });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await service
      .from("stories")
      .update({
        linked_pool_address: body.poolAddress,
        linked_pool_dex: dex,
        linked_pool_label: label,
      })
      .eq("id", story.id);

    return NextResponse.json({
      id: data?.id,
      poolAddress: body.poolAddress,
      label,
      pairLabel: story.pair_label,
    });
  } catch (error) {
    return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
  }
}
