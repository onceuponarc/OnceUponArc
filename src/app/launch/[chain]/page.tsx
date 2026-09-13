import { LaunchStudio } from "@/components/launch/launch-studio";
import { getSessionUser } from "@/lib/auth";
import { findChain, isPrintableChain } from "@onceupon/config/solana";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ chain: string }> };

export async function generateMetadata({ params }: Props) {
  const { chain } = await params;
  const card = findChain(chain);
  return { title: card ? `Launch on ${card.title}` : "Launch" };
}

export default async function LaunchChainPage({ params }: Props) {
  const { chain } = await params;
  if (!isPrintableChain(chain)) redirect("/launch/arc");
  const { profile } = await getSessionUser();

  return (
    <div className="space-y-6">
      <section className="glass relative overflow-hidden rounded-[28px] border border-arc/25 px-5 py-7 sm:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">The Press · Arc</p>
        <h1 className="font-heading mt-2 text-3xl font-extrabold sm:text-4xl">
          Native Chapter on Arc. Funded Devnet wallet signs create, buy, and sell.
        </h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          OnceUpon is an Arc launchpad. MockUSDC is the quote on Devnet. You do not seed an AMM at print. Your USDC
          stays in the book until graduation.
        </p>
      </section>

      <LaunchStudio chain="arc" handle={profile?.handle ?? null} signedIn={Boolean(profile)} />
    </div>
  );
}
