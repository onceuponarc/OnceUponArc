import { LaunchStudio } from "@/components/launch/launch-studio";
import { SolanaLaunchStudio } from "@/components/launch/solana-launch-studio";
import { LaunchChainSwitch } from "@/components/launch/chain-switch";
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
  if (!isPrintableChain(chain)) redirect("/launch");
  const { profile } = await getSessionUser();
  const solana = chain === "solana";

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-white/10 px-5 py-7 sm:px-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/banner.jpg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/50" />
        <div className="relative flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.jpg" alt="" className="size-12 rounded-xl border border-white/15 object-cover" />
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
            Launch · {solana ? "Solana" : "Arc"}
          </p>
        </div>
        <h1 className="relative mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          {solana ? "Launch on Solana" : "Launch on Arc"}
        </h1>
        <p className="relative mt-3 max-w-2xl text-white/60">
          {solana
            ? "Pump.fun curve. OrbitX metadata. Custom …obx mint. Sign in Phantom."
            : "Chapter token, tweet spawn, press card, or token + card. Coin and jacket stay separate when you pair them."}
        </p>
        <div className="relative mt-5">
          <LaunchChainSwitch current={solana ? "/launch/solana" : "/launch/arc"} />
        </div>
      </section>
      {solana ? (
        <SolanaLaunchStudio handle={profile?.handle ?? null} />
      ) : (
        <LaunchStudio chain="arc" handle={profile?.handle ?? null} signedIn={Boolean(profile)} />
      )}
    </div>
  );
}
