import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_SITE_URL } from "@onceupon/config/urls";
import { PAD_CREATED_ON, PAD_NAME, metadataDescription, venueLabel } from "@onceupon/config/launchpad";

const FULL =
  "title, ticker, blurb, cover_url, image_uri, twitter_url, telegram_url, website_url, venue, chain, slug, users:author_user_id(handle)";
const MIN = "title, ticker, blurb, cover_url";

export async function GET(
  _request: Request,
  context: { params: Promise<{ mint: string }> },
) {
  const { mint } = await context.params;
  const supabase = await createClient();
  let { data } = await supabase.from("stories").select(FULL).eq("token_address", mint).maybeSingle();
  if (!data) {
    const fallback = await supabase.from("stories").select(MIN).eq("token_address", mint).maybeSingle();
    data = fallback.data as typeof data;
  }

  const author = data && "users" in data ? (Array.isArray(data.users) ? data.users[0] : data.users) : null;
  const handle = author && typeof author === "object" && "handle" in author ? String(author.handle) : null;
  const image =
    (data && "image_uri" in data ? (data.image_uri as string | null) : null) ||
    data?.cover_url ||
    `${PUBLIC_SITE_URL}/onceupon-cover.svg`;
  const twitter = data && "twitter_url" in data ? (data.twitter_url as string | null) : null;
  const telegram = data && "telegram_url" in data ? (data.telegram_url as string | null) : null;
  const website = data && "website_url" in data ? (data.website_url as string | null) : null;
  const venue = data && "venue" in data ? String(data.venue ?? "spl") : "spl";

  return NextResponse.json(
    {
      name: data?.title ?? PAD_NAME,
      symbol: data?.ticker ?? "ONCE",
      description: metadataDescription(data?.blurb ?? "", handle),
      image,
      showName: true,
      createdOn: PAD_CREATED_ON,
      twitter: twitter || undefined,
      telegram: telegram || undefined,
      website: website || undefined,
      launchpad: PAD_NAME,
      venue: venueLabel(venue),
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
