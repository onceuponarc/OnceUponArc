import { EmbeddedWalletCard } from "@/components/wallet/embedded-wallet";
import { BindSolanaWallet } from "@/components/wallet/bind-solana-wallet";
import { JupiterSwapPanel } from "@/components/jupiter/swap-panel";
import { getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { XMark } from "@/components/x-mark";

export const metadata = { title: "Trade" };

export default async function WalletPage() {
  const { profile } = await getSessionUser();

  return (
    <div className="space-y-8">
      <section className="glass rounded-3xl border border-gold/25 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Trade</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold">Pad wallet first. Jupiter for the route.</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          Sign in with X and the pad creates a Solana wallet for launches. Connect Phantom, Solflare, or Backpack
          to swap through Jupiter. Fund the pad wallet with real SOL — there is no faucet.
        </p>
      </section>
      {profile ? (
        <EmbeddedWalletCard />
      ) : (
        <div className="glass rounded-2xl border border-gold/25 p-6">
          <h2 className="font-heading text-xl font-bold">Sign in to get a Solana pad wallet</h2>
          <Button asChild className="mt-4">
            <a href="/auth/login">
              <XMark className="size-3.5" />
              Sign in with X
            </a>
          </Button>
        </div>
      )}
      <JupiterSwapPanel />
      {profile ? <BindSolanaWallet /> : null}
    </div>
  );
}
