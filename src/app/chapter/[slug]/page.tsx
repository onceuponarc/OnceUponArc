import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { POSITIONING } from "@onceupon/config/copy";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArcQuoteRow } from "@/components/crypto/headless";

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
    <div className="space-y-8">
      <section className="glass relative overflow-hidden rounded-3xl border border-gold/25 px-6 py-12 sm:px-12">
        <div className="pointer-events-none absolute -right-8 top-0 size-64 rounded-full bg-gold/20 blur-3xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Featured window</p>
        <h1 className="font-heading mt-3 text-5xl font-extrabold sm:text-6xl">{chapter.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-parchment/80">{POSITIONING}</p>
        <p className="mt-3 max-w-2xl text-parchment/65">
          First official launch window on OnceUpon. Solana is the live printer. Arc launches are not open yet. This is not studio equity.
        </p>
        {chapter.opens_at ? (
          <p className="mt-4 text-sm text-gold">Opens {new Date(chapter.opens_at).toUTCString()}</p>
        ) : null}
        <div className="mt-6 space-y-4">
          <ArcQuoteRow />
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/launch/solana">Launch on Solana</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/launch">Choose a chain</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
