import { CryptoPlayground } from "@/components/crypto/playground";
import { ThirdwebKeyNotice } from "@/components/crypto/key-notice";
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
        <h1 className="font-heading mt-2 text-4xl font-extrabold">Pad wallet first. Connect if you want.</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          Sign in with X and the pad creates a Solana wallet for this chain. Export the secret anytime.
          Connecting MetaMask / Phantom is optional — launches sign with the pad wallet so testnet mints
          actually land.
        </p>
      </section>
      {profile ? (
        <EmbeddedWalletCard />
      ) : (
        <div className="glass rounded-2xl border border-gold/25 p-6">
          <h2 className="font-heading text-xl font-bold">Sign in to get a Solana wallet</h2>
          <Button asChild className="mt-4">
            <a href="/auth/login">
              <XMark className="size-3.5" />
              Sign in with X
            </a>
          </Button>
        </div>
      )}
      <ThirdwebKeyNotice />
      <CryptoPlayground />
    </div>
  );
}
