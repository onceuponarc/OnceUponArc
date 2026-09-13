import { ConnectedWalletCard } from "@/components/wallet/connected-wallet";
import { JupiterSwapPanel } from "@/components/jupiter/swap-panel";
import { getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { XMark } from "@/components/x-mark";
import Link from "next/link";

export const metadata = { title: "Trade" };

export default async function WalletPage() {
  const { profile } = await getSessionUser();

  return (
    <div className="space-y-6">
      <section className="glass rounded-[28px] border border-arc/25 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">Trade</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold">Your wallet. Jupiter routes.</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          Connect Phantom, Solflare, or Backpack. Sign in with X to bind the address. Quotes come from
          Jupiter. Swaps sign in your wallet — OnceUpon never holds a key.
        </p>
      </section>
      <ConnectedWalletCard signedIn={Boolean(profile)} />
      <JupiterSwapPanel signedIn={Boolean(profile)} />
      {!profile ? (
        <div className="glass rounded-2xl border border-arc/20 p-5">
          <h2 className="font-heading text-xl font-bold">Sign in with X to bind this wallet</h2>
          <Button asChild className="mt-4 rounded-full">
            <Link href="/auth/login">
              <XMark className="size-3.5" />
              Sign in with X
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
