import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const { profile } = await getSessionUser();
  const supabase = await createClient();
  const { data: story } = await supabase
    .from("stories")
    .select("id, slug, title, engine, vault_address, ticker")
    .eq("slug", slug)
    .maybeSingle();

  if (!story) return NextResponse.json({ error: "Unknown Story." }, { status: 404 });

  const { data: fees } = await supabase
    .from("fee_events")
    .select("vault_amount, author_amount, protocol_amount, asset")
    .eq("story_id", story.id);

  const vaultIn = (fees ?? []).reduce((sum, row) => sum + Number(row.vault_amount ?? 0), 0);

  return NextResponse.json({
    slug: story.slug,
    engine: story.engine,
    vault: story.vault_address,
    vaultInflowsAtomic: vaultIn,
    viewer: profile?.handle ?? null,
    pending: "on-chain accumulator after Phase 2",
  });
}
