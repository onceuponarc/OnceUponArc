import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { POSITIONING } from "@onceupon/config/copy";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArcQuoteRow } from "@/components/crypto/headless";
import { OnceUponConnectButton } from "@/components/crypto/connect";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return { title: slug.replaceAll("-", " ") };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: chapter } = await supabase
    .from("chapters")
    .select("slug, title, opens_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!chapter) notFound();

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <p className="text-xs uppercase tracking-[0.28em] text-gold">A Chapter</p>
      <h1 className="font-heading text-5xl">{chapter.title}</h1>
      <p className="text-lg text-parchment/80">{POSITIONING}</p>
      <p className="text-parchment/70">
        This is the first official launch window on OnceUpon. Tokens mint on Circle Arc. The desk is
        parchment; the receipts are USDC. The First Chapter is not studio equity.
      </p>
      {chapter.opens_at ? (
        <p className="text-sm text-gold">
          Opens {new Date(chapter.opens_at).toUTCString()}
        </p>
      ) : null}
      <ArcQuoteRow />
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/write">Write into this Chapter</Link>
        </Button>
        <OnceUponConnectButton />
      </div>
    </article>
  );
}
