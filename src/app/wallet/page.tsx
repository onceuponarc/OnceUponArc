import { ArcWalletDesk } from "@/components/arc/arc-wallet-desk";
import { ArcDevnetWallet } from "@/components/arc/devnet-wallet";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = { title: "Wallet" };

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Wallet</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Your Arc keys</h1>
        <p className="mt-3 max-w-2xl text-white/60">
          Two separate wallets: Devnet for this pad, Mainnet for when Arc is live. Keys live in this browser only. Copy
          them into MetaMask or Rabby. Do not reuse a Devnet key on mainnet.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/launch/arc">Launch a token</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools">Network tools</Link>
          </Button>
        </div>
      </section>
      <ArcDevnetWallet />
      <ArcWalletDesk />
    </div>
  );
}
