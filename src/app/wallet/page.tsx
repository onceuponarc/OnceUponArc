import { WalletDesk } from "@/components/wallet/desk";
import { HoldingsPanel } from "@/components/wallet/holdings";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = { title: "Wallet" };

export default function WalletPage() {
  return (
    <div className="space-y-6 pad-fade">
      <section className="rounded-3xl border border-white/10 p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Wallet</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Your desk</h1>
        <p className="mt-3 max-w-2xl text-white/60">
          Addresses and live balances only. Fund a chain, launch, collect fees. Private keys live on a separate
          export page.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/launch">Launch</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/wallet/keys">Export keys</Link>
          </Button>
        </div>
      </section>
      <HoldingsPanel />
      <WalletDesk />
    </div>
  );
}
