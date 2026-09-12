import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stories")
    .select(
      "slug, title, ticker, blurb, engine, status, pair_label, author_bps, protocol_bps, token_address, vault_address, cover_url, jacket_url",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Unknown Story." }, { status: 404 });
  return NextResponse.json(data);
}
