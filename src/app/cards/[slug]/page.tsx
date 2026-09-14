import { notFound } from "next/navigation";
import Link from "next/link";
import { viewOneCard } from "@/lib/cards/resolve";
import { CardJacket } from "@/components/cards/card-jacket";
import { ClaimDesk } from "@/components/cards/claim-desk";
import { OwnerDesk } from "@/components/cards/owner-desk";
import { getSessionUser } from "@/lib/auth";
import { formatUsd } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await viewOneCard(slug);
  if (!card) return { title: "Card" };
  return {
    title: `$${card.ticker} jacket`,
    description: `${card.title} · ${card.multiple.toFixed(2)}x · start $${card.startPriceUi}`,
    openGraph: {
      title: `$${card.ticker} · OnceUpon jacket`,
      description: card.blurb,
      images: card.coverUrl ? [card.coverUrl] : ["/brand/banner.jpg"],
    },
  };
}

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const card = await viewOneCard(slug);
  if (!card) notFound();
  const { profile } = await getSessionUser();
  const isOwner = Boolean(profile && profile.handle.toLowerCase() === card.ownerHandle.toLowerCase());

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <CardJacket card={card} />
      <div className="space-y-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Jacket</p>
        <h1 className="text-4xl font-semibold tracking-tight">${card.ticker}</h1>
        <p className="text-white/60">{card.blurb}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-white/10 p-3">
            <dt className="text-white/40">Value</dt>
            <dd className="text-xl font-semibold">{formatUsd(card.valueUi)}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 p-3">
            <dt className="text-white/40">Multiple</dt>
            <dd className="text-xl font-semibold">{card.multiple.toFixed(2)}x</dd>
          </div>
          <div className="rounded-2xl border border-white/10 p-3">
            <dt className="text-white/40">Start MC</dt>
            <dd>{formatUsd(card.startMcapUi)}</dd>
          </div>
          <div className="rounded-2xl border border-white/10 p-3">
            <dt className="text-white/40">Live MC</dt>
            <dd>{formatUsd(card.currentMcapUi)}</dd>
          </div>
        </dl>
        {card.storySlug ? (
          <Link href={`/story/${card.storySlug}`} className="block text-sm text-white underline">
            Paired Chapter /{card.storySlug}
          </Link>
        ) : (
          <p className="text-sm text-white/45">No paired coin. Value stays at start until you link a Chapter.</p>
        )}
        {card.tweetUrl ? (
          <a href={card.tweetUrl} target="_blank" rel="noreferrer" className="block text-sm text-white/70 underline">
            Source post
          </a>
        ) : null}
        {isOwner ? <OwnerDesk card={card} /> : <ClaimDesk card={card} />}
      </div>
    </div>
  );
}
