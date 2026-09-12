import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { ARC_TESTNET } from "@onceupon/config/arc";
import { POSITIONING } from "@onceupon/config/copy";
import Link from "next/link";

export default async function DeskPage() {
  const supabase = await createClient();
  const { profile } = await getSessionUser();

  const { data: chapter } = await supabase
    .from("chapters")
    .select("slug, title, opens_at")
    .eq("slug", "the-first-chapter")
    .maybeSingle();

  const { data: stories, error } = await supabase
    .from("stories")
    .select("slug, title, ticker, blurb, engine, pair_label, author_bps, cover_url, users:author_user_id(handle)")
    .in("status", ["live", "graduated"])
    .order("created_at", { ascending: false })
    .limit(24);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-gold">The Desk</p>
          <h1 className="font-heading text-4xl leading-tight sm:text-5xl">
            Childhood is the feeling.
            <span className="block text-gold">The Piece is a protocol reward.</span>
          </h1>
          <p className="max-w-2xl text-parchment/75">{POSITIONING}</p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/write">Write a Story</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/chapter/the-first-chapter">Open The First Chapter</Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Network</CardTitle>
            <CardDescription>Ship on testnet until official mainnet RPC exists.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              {ARC_TESTNET.name} · chain {ARC_TESTNET.chainId}
            </p>
            <p>Gas is native USDC (18 decimals). Pools use ERC-20 USDC (6 decimals).</p>
            <p>
              <a className="text-gold hover:underline" href={ARC_TESTNET.explorer}>
                ArcScan
              </a>
              {" · "}
              <a className="text-gold hover:underline" href={ARC_TESTNET.faucet}>
                Faucet
              </a>
            </p>
            {profile ? (
              <p className="text-parchment/70">
                Signed in as @{profile.handle}. Connect an Arc wallet on The Press before a launch.
              </p>
            ) : (
              <p className="text-parchment/70">A OnceUponer is an X account. There is no email signup.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="rounded-xl border border-gold/25 bg-parchment/5 p-6">
        <p className="text-xs uppercase tracking-[0.28em] text-gold">Chapter</p>
        <h2 className="font-heading mt-2 text-3xl">{chapter?.title ?? "The First Chapter"}</h2>
        <p className="mt-2 max-w-2xl text-parchment/75">
          The first official launch on the pad. No live Story yet — the Press is open for rehearsal on
          Arc testnet.
        </p>
        <Button className="mt-4" variant="secondary" asChild>
          <Link href="/chapter/the-first-chapter">Read the landing</Link>
        </Button>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-heading text-2xl">Live Stories</h2>
          <Badge variant="outline">Arc testnet</Badge>
        </div>
        {error ? (
          <Card>
            <CardHeader>
              <CardTitle>The shelf could not be read</CardTitle>
              <CardDescription>{error.message}</CardDescription>
            </CardHeader>
          </Card>
        ) : !stories?.length ? (
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">The desk is set. The ink is still wet.</CardTitle>
              <CardDescription>
                No live Stories yet. Write the first one from The Press. Author fees push themselves.
                OnceUponers fees sit in an ownerless vault.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => {
              const author = Array.isArray(story.users) ? story.users[0] : story.users;
              return (
                <Link key={story.slug} href={`/story/${story.slug}`}>
                  <Card className="h-full transition hover:border-gold/50">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="font-heading">{story.title}</CardTitle>
                        <Badge>{story.ticker}</Badge>
                      </div>
                      <CardDescription>
                        {story.engine === "author" ? "Author fees" : "The Piece"} · {story.pair_label} ·{" "}
                        {(story.author_bps / 100).toFixed(2)}%
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-parchment/70">
                      <p>{story.blurb || "A Story on Arc."}</p>
                      {author && "handle" in author ? (
                        <p className="mt-3 text-xs text-gold">@{String(author.handle)}</p>
                      ) : null}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
