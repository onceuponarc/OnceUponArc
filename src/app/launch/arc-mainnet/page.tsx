import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Arc mainnet · Friday" };

export default function ArcMainnetBlockedPage() {
  return (
    <div className="mx-auto max-w-xl space-y-5 rounded-3xl border border-white/10 p-8 text-center">
      <LaunchChainSwitch current="/launch/arc-mainnet" />
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-300">Coming Friday</p>
      <h1 className="text-4xl font-semibold tracking-tight">Arc mainnet</h1>
      <p className="text-white/60">
        The live Arc print window opens Friday. Devnet is open now. Same studio, live USDC, no mock faucet.
      </p>
      <Button asChild>
        <Link href="/launch/arc">Use Arc Devnet</Link>
      </Button>
    </div>
  );
}
