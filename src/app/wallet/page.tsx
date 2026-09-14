import { ArcWalletDesk } from "@/components/arc/arc-wallet-desk";
import { WalletDesk } from "@/components/wallet/desk";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = { title: "Wallet" };

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Wallet</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Your dev wallet</h1>
        <p className="mt-3 max-w-2xl text-white/60">
          This is the wallet that launches and trades. Fund it. Arc uses USDC on the EVM address. Solana uses SOL on
          the Solana address. That same address receives trading fees. You do not connect Phantom or MetaMask to print.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/launch">Launch desk</Link>
          </Button>
        </div>
      </section>
      <WalletDesk />
      <ArcWalletDesk />
    </div>
  );
}
