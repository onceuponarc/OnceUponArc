import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_SITE_URL } from "@onceupon/config/urls";

export async function GET(
  _request: Request,
  context: { params: Promise<{ mint: string }> },
) {
  const { mint } = await context.params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("stories")
    .select("title, ticker, blurb, cover_url")
    .eq("token_address", mint)
    .maybeSingle();

  return NextResponse.json({
    name: data?.title ?? "OnceUpon",
    symbol: data?.ticker ?? "ONCE",
    description: data?.blurb ?? "A launch on OnceUpon.",
    image: data?.cover_url ?? `${PUBLIC_SITE_URL}/pad-bg.png`,
  });
}
