import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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
  };

  if (!body.storySlug || !body.chainCaip2 || !body.poolAddress) {
    return NextResponse.json({ error: "Story, chain, and pool are required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: story } = await supabase
    .from("stories")
    .select("id, author_user_id, pair_class, rwa_issuer")
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

  const { data, error } = await supabase
    .from("bindings")
    .insert({
      story_id: story.id,
      kind: body.kind ?? "linked_other",
      is_primary: false,
      chain_caip2: body.chainCaip2,
      pool_address: body.poolAddress,
      mechanism: body.mechanism ?? "other",
      proof_url: body.proofUrl,
      fee_routing: "arc_only",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
