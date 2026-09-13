import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = await createClient();
  const full = await supabase
    .from("stories")
    .select(
      "slug, title, ticker, blurb, engine, status, pair_label, author_bps, protocol_bps, token_address, vault_address, cover_url, jacket_url, twitter_url, telegram_url, website_url, image_uri, metadata_uri",
    )
    .eq("slug", slug)
    .maybeSingle();
  const fallback = full.error
    ? await supabase
        .from("stories")
        .select("slug, title, ticker, blurb, engine, status, pair_label, author_bps, protocol_bps, token_address, vault_address, cover_url, jacket_url")
        .eq("slug", slug)
        .maybeSingle()
    : null;
  const data = full.data ?? fallback?.data ?? null;
  const error = full.data ? null : fallback?.error ?? full.error;

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Unknown Story." }, { status: 404 });
  return NextResponse.json(data);
}
