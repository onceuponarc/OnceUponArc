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
      <section className="rounded-2xl border border-white/10 px-5 py-7 sm:px-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Launch · Arc</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Create a token on Arc</h1>
        <p className="mt-3 max-w-2xl text-white/60">
          USDC bonding curve. Tradable the moment create lands. Graduation opens the pool from the vault. Devnet is
          live.
        </p>
      </section>
      <LaunchStudio chain="arc" handle={profile?.handle ?? null} signedIn={Boolean(profile)} />
    </div>
  );
}
