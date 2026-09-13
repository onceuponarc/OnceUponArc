import { EmbeddedWalletCard } from "@/components/wallet/embedded-wallet";
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
        <h1 className="font-heading mt-2 text-4xl font-extrabold">X login. Supabase wallet. Jupiter route.</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          Sign in with X. That login is the wallet connection — Supabase stores the pad keypair. Jupiter
          quotes every swap and the pad wallet signs it. Fund the address with real SOL. There is no faucet
          and no injected wallet.
        </p>
      </section>
      {profile ? (
        <EmbeddedWalletCard />
      ) : (
        <div className="glass rounded-2xl border border-gold/25 p-6">
          <h2 className="font-heading text-xl font-bold">Sign in with X to open the pad wallet</h2>
          <Button asChild className="mt-4">
            <a href="/auth/login">
              <XMark className="size-3.5" />
              Sign in with X
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
