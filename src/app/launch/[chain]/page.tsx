import { LaunchStudio } from "@/components/launch/launch-studio";
import { ConnectedWalletCard } from "@/components/wallet/connected-wallet";
import { getSessionUser } from "@/lib/auth";
import { findChain, isLaunchChain, isPrintableChain } from "@onceupon/config/solana";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ chain: string }> };

export async function generateMetadata({ params }: Props) {
  const { chain } = await params;
  const card = findChain(chain);
  return { title: card ? `Launch on ${card.title}` : "Launch" };
}

export default async function LaunchChainPage({ params }: Props) {
  const { chain } = await params;
  if (!isLaunchChain(chain)) notFound();
  const card = findChain(chain)!;

  if (!isPrintableChain(chain) || !card.live) {
    return (
      <div className="glass mx-auto max-w-xl space-y-4 rounded-3xl border border-arc/25 p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">Not yet</p>
        <h1 className="font-heading text-4xl font-extrabold">{card.title} is not open</h1>
        <p className="text-parchment/75">{card.body}</p>
        <p className="text-sm text-parchment/60">{card.printNote}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/launch/arc">Open the Arc press</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/launch">All chains</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { profile } = await getSessionUser();

  return (
    <div className="space-y-6">
      <section className="glass relative overflow-hidden rounded-[28px] border border-arc/25 px-5 py-7 sm:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">The Press · {card.title}</p>
        <h1 className="font-heading mt-2 text-3xl font-extrabold sm:text-4xl">
          {chain === "arc"
            ? "Native Chapter on Arc. Funded Devnet wallet signs create, buy, and sell."
            : chain === "solana"
              ? "Print a real Solana token."
              : `Launch tagged for ${card.title}.`}
        </h1>
        <p className="mt-3 max-w-2xl text-parchment/75">{card.printNote}</p>
      </section>

      {chain !== "arc" ? <ConnectedWalletCard signedIn={Boolean(profile)} /> : null}

      <LaunchStudio chain={chain} handle={profile?.handle ?? null} signedIn={Boolean(profile)} />
    </div>
  );
}
