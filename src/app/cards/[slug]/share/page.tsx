import { notFound } from "next/navigation";
import { viewOneCard } from "@/lib/cards/resolve";
import { CardJacket } from "@/components/cards/card-jacket";

export const dynamic = "force-dynamic";

export default async function CardSharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await viewOneCard(slug);
  if (!card) notFound();
  return (
    <div className="flex min-h-[80dvh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        <CardJacket card={card} />
        <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-white/35">
          OrbitX · Arc · /cards/{card.slug}
        </p>
      </div>
    </div>
  );
}
