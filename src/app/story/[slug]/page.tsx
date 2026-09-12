import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PIECE_EXPLAINER, AUTHOR_FEE_EXPLAINER } from "@onceupon/config/copy";
import { notFound } from "next/navigation";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: slug };
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: story } = await supabase
    .from("stories")
    .select(
      "title, ticker, blurb, engine, status, pair_label, author_bps, protocol_bps, vault_address, token_address, users:author_user_id(handle, display_name, portrait_url)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!story) notFound();
  const author = Array.isArray(story.users) ? story.users[0] : story.users;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gold">The Story</p>
          <h1 className="font-heading mt-2 text-4xl">{story.title}</h1>
          <p className="mt-2 text-parchment/70">{story.blurb}</p>
        </div>
        <div className="flex gap-2">
          <Badge>{story.ticker}</Badge>
          <Badge variant="outline">{story.engine === "author" ? "Author" : "OnceUponers"}</Badge>
          <Badge variant="secondary">{story.status}</Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Fees</CardTitle>
            <CardDescription>
              {story.engine === "author" ? AUTHOR_FEE_EXPLAINER : PIECE_EXPLAINER}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Author { (story.author_bps / 100).toFixed(2) }% · protocol {(story.protocol_bps / 100).toFixed(2)}%</p>
            <p>Quote {story.pair_label}</p>
            {story.engine === "onceuponers" ? (
              <p>Vault {story.vault_address ?? "deploys at launch"}</p>
            ) : (
              <p>No claim button. Fees push on each swap.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Author</CardTitle>
          </CardHeader>
          <CardContent>
            {author && "handle" in author ? (
              <Link href={`/shelf/${author.handle}`} className="text-gold hover:underline">
                @{String(author.handle)}
              </Link>
            ) : (
              <p>Unknown OnceUponer</p>
            )}
            <p className="mt-3 text-sm text-parchment/60">
              Buy and sell land here after the factory is live on 5042002.
            </p>
            <Button className="mt-4" variant="outline" disabled>
              Trade (Phase 1)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
