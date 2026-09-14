import Link from "next/link";
import { LaunchChainSwitch } from "@/components/launch/chain-switch";

const LANES = [
  {
    href: "/launch/arc",
    label: "Arc",
    status: "Mainnet · 5042",
    body: "Early Arc mainnet. USDC gas. Chapter curve, tweet, card, pair.",
  },
  {
    href: "/launch/solana",
    label: "Solana · pump.fun",
    status: "Live",
    body: "IPFS art, …obx vanity, Phantom gas, claim creator fees.",
  },
];

export const metadata = { title: "Launch" };

export default function LaunchHubPage() {
  return (
    <div className="space-y-6">
      <section>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Launch desk</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Pick a chain</h1>
        <p className="mt-3 max-w-2xl text-white/55">
          Arc is on early mainnet (chain 5042). Solana prints on pump.fun under OrbitX metadata.
        </p>
        <div className="mt-5">
          <LaunchChainSwitch current="/launch" />
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {LANES.map((lane) => (
          <Link key={lane.href} href={lane.href} className="rounded-3xl border border-white/10 p-5 hover:border-white/30">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-cyan-300">{lane.status}</p>
            <h2 className="mt-2 text-2xl font-semibold">{lane.label}</h2>
            <p className="mt-2 text-sm text-white/55">{lane.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
