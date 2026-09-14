import { notFound } from "next/navigation";
import { loadPadMarket } from "@/lib/market";
import { ChapterJacket } from "@/components/story/chapter-jacket";

export const dynamic = "force-dynamic";

export default async function StorySharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { launches } = await loadPadMarket();
  const launch = launches.find((row) => row.slug === slug);
  if (!launch) notFound();
  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <ChapterJacket
          ticker={launch.ticker}
          title={launch.title}
          blurb={launch.blurb}
          coverUrl={launch.coverUrl}
          status={launch.status}
          handle={launch.handle}
          snipeTaxBps={0}
        />
        <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
          OnceUpon · Arc · /story/{launch.slug}
        </p>
      </div>
    </div>
  );
}
