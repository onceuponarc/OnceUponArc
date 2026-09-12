import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-in-button";
import { getSessionUser } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return { title: `@${handle}` };
}

export default async function ShelfPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const supabase = await createClient();
  const { profile: me } = await getSessionUser();
  const { data: user } = await supabase
    .from("users")
    .select("id, handle, display_name, bio, portrait_url, storage_portrait_path")
    .eq("handle", handle)
    .maybeSingle();

  if (!user) notFound();

  const { data: stories } = await supabase
    .from("stories")
    .select("slug, title, ticker, engine, status")
    .eq("author_user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: claims } = await supabase
    .from("piece_claims")
    .select("id, amount, asset")
    .eq("user_id", user.id);

  const portrait = user.storage_portrait_path ?? user.portrait_url;
  const isSelf = me?.id === user.id;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar size="lg" className="size-20">
          {portrait ? <AvatarImage src={portrait} alt="" /> : null}
          <AvatarFallback>{user.handle.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.28em] text-gold">The Shelf</p>
          <h1 className="font-heading text-4xl">{user.display_name}</h1>
          <p className="text-gold">@{user.handle}</p>
          <p className="mt-2 max-w-xl text-parchment/75">{user.bio || "No bio copied from X yet."}</p>
        </div>
        {isSelf ? <SignOutButton /> : null}
      </div>

      <section>
        <h2 className="font-heading text-2xl">Stories written</h2>
        {!stories?.length ? (
          <p className="mt-3 text-parchment/60">This OnceUponer has not gone to The Press yet.</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {stories.map((story) => (
              <Link key={story.slug} href={`/story/${story.slug}`}>
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading flex items-center justify-between">
                      {story.title}
                      <Badge>{story.ticker}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-parchment/70">
                    {story.engine} · {story.status}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-heading text-2xl">Pieces claimed</h2>
        <p className="mt-2 text-sm text-parchment/60">
          {claims?.length
            ? `${claims.length} claim receipt${claims.length === 1 ? "" : "s"} mirrored from chain.`
            : "No Pieces claimed yet. Selling before you claim forfeits unsaved accumulator."}
        </p>
      </section>
    </div>
  );
}
