import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-in-button";
import { getSessionUser } from "@/lib/auth";
import { EmptyPad } from "@/components/pad/launch-card";

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
  const { profile: me } = await getSessionUser();
  let user: {
    id: string;
    handle: string;
    display_name: string;
    bio: string | null;
    portrait_url: string | null;
    storage_portrait_path: string | null;
  } | null = null;
  let stories: { slug: string; title: string; ticker: string; engine: string; status: string }[] | null = [];
  let claims: { id: string; amount: number; asset: string }[] | null = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("users")
      .select("id, handle, display_name, bio, portrait_url, storage_portrait_path")
      .eq("handle", handle)
      .maybeSingle();
    user = data;
    if (user) {
      const [{ data: storyRows }, { data: claimRows }] = await Promise.all([
        supabase
          .from("stories")
          .select("slug, title, ticker, engine, status")
          .eq("author_user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase.from("piece_claims").select("id, amount, asset").eq("user_id", user.id),
      ]);
      stories = storyRows;
      claims = claimRows;
    }
  } catch (error) {
    console.error("Shelf load failed", error);
    return (
      <div className="glass mx-auto max-w-lg space-y-3 rounded-3xl border border-gold/25 p-8">
        <h1 className="font-heading text-3xl font-bold">This shelf could not load</h1>
        <p className="text-parchment/70">Supabase did not answer. Reload, then sign in with X if this is your profile.</p>
      </div>
    );
  }

  if (!user) notFound();

  const portrait = user.storage_portrait_path ?? user.portrait_url;
  const isSelf = me?.id === user.id;

  return (
    <div className="space-y-8">
      <section className="glass flex flex-col gap-4 rounded-3xl border border-gold/25 p-6 sm:flex-row sm:items-center">
        <Avatar size="lg" className="size-20">
          {portrait ? <AvatarImage src={portrait} alt="" /> : null}
          <AvatarFallback>{user.handle.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Profile</p>
          <h1 className="font-heading text-4xl font-extrabold">{user.display_name}</h1>
          <p className="text-gold">@{user.handle}</p>
          <p className="mt-2 max-w-xl text-parchment/75">{user.bio || "No bio copied from X yet."}</p>
        </div>
        {isSelf ? <SignOutButton /> : null}
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold">Launches</h2>
        {!stories?.length ? (
          <EmptyPad
            className="mt-4"
            title="No launches yet"
            body="This OnceUponer has not printed a token on the pad."
          />
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {stories.map((story) => (
              <Link key={story.slug} href={`/story/${story.slug}`}>
                <Card className="transition hover:border-gold/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {story.title}
                      <Badge>{story.ticker}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-parchment/70">
                    {story.engine === "author" ? "Author" : "OnceUponers"} ·{" "}
                    {story.status === "graduated" ? "bonded" : story.status}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold">Pieces claimed</h2>
        <p className="mt-2 text-sm text-parchment/60">
          {claims?.length
            ? `${claims.length} claim receipt${claims.length === 1 ? "" : "s"} mirrored from chain.`
            : "No Pieces claimed yet. Selling before you claim forfeits unsaved accumulator."}
        </p>
      </section>
    </div>
  );
}
