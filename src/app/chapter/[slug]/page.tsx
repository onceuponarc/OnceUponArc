import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { POSITIONING } from "@onceupon/config/copy";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  let chapter: { slug: string; title: string; opens_at: string | null } | null = null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("chapters").select("slug, title, opens_at").eq("slug", slug).maybeSingle();
    chapter = data;
  } catch (error) {
    console.error("Chapter load failed", error);
    return (
      <div className="glass mx-auto max-w-lg space-y-3 rounded-3xl border border-gold/25 p-8">
        <h1 className="font-heading text-3xl font-bold">This chapter could not load</h1>
        <p className="text-parchment/70">Supabase did not answer. Reload to try again.</p>
      </div>
    );
  }

  if (!chapter) notFound();

  return (
    <div className="space-y-8">
      <section className="glass relative overflow-hidden rounded-3xl border border-gold/25 px-6 py-12 sm:px-12">
        <div className="pointer-events-none absolute -right-8 top-0 size-64 rounded-full bg-gold/20 blur-3xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Featured window</p>
        <h1 className="font-heading mt-3 text-5xl font-extrabold sm:text-6xl">{chapter.title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-parchment/80">{POSITIONING}</p>
        <p className="mt-3 max-w-2xl text-parchment/65">
          First official launch window on OnceUpon. The press is Arc. Quote is USDC. This is not studio equity.
        </p>
        {chapter.opens_at ? (
          <p className="mt-4 text-sm text-gold">Opens {new Date(chapter.opens_at).toUTCString()}</p>
        ) : null}
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href="/launch/arc">Launch on Arc</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/wallet">Trade</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
