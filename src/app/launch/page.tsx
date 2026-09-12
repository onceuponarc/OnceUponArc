import { LaunchStudio } from "@/components/launch/launch-studio";
import { EmbeddedWalletCard } from "@/components/wallet/embedded-wallet";
import { LaunchTypeGrid, PairStrip } from "@/components/pad/launch-types";
import { getSessionUser } from "@/lib/auth";
import { BONDING_COPY } from "@onceupon/config/copy";
import { VENUES } from "@onceupon/config/solana";
import { Button } from "@/components/ui/button";
import { XMark } from "@/components/x-mark";
import { ensureSolanaWallet, solBalance } from "@/lib/wallets/embedded";

export const metadata = { title: "Launch" };

export default async function LaunchPage() {
  const { user, profile } = await getSessionUser();
  let walletAddress: string | null = null;
  let balance: number | null = null;
  if (user) {
    try {
      const wallet = await ensureSolanaWallet(user.id);
      walletAddress = wallet.address;
      balance = await solBalance(wallet.address);
    } catch {
      walletAddress = null;
    }
  }

  return (
    <div className="space-y-10">
      <section className="glass relative overflow-hidden rounded-3xl border border-gold/25 px-6 py-10 sm:px-10">
        <div className="pointer-events-none absolute -right-10 top-0 size-56 rounded-full bg-burgundy/25 blur-3xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Launchpad</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold sm:text-5xl">Print a real token.</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          Solana mainnet is live. Pick SPL, NFT, Pump.fun-style, or Pons-style. Author or OnceUponers. Pair
          SOL, USDC, any mint, or a tokenized name when that mint exists. Arc testnet is live for wallets
          and quotes. Robinhood Chain uses the same flow when that rail is wired.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-parchment/55">{BONDING_COPY}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-parchment/60">
          {VENUES.map((venue) => (
            <span key={venue.id} className="rounded-full border border-gold/25 px-3 py-1">
              {venue.title}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Engines</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">How each fee path works</h2>
        </div>
        <LaunchTypeGrid detailed />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Pairs</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">What you launch against</h2>
        </div>
        <PairStrip />
      </section>

      <section className="space-y-4" id="compose">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Compose</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">Launch on Solana mainnet</h2>
        </div>
        {!profile ? (
          <div className="glass rounded-2xl border border-gold/25 p-8 text-center">
            <h3 className="font-heading text-2xl font-bold">Sign in with X to launch</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-parchment/65">
              Your X handle is identity. Sign-in mints a fresh Solana wallet for this pad. You can export
              the key anytime, or connect an external wallet later.
            </p>
            <Button asChild size="lg" className="mt-6 h-11 px-5">
              <a href="/auth/login">
                <XMark className="size-4" />
                Sign in with X
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <EmbeddedWalletCard />
            <LaunchStudio handle={profile.handle} walletAddress={walletAddress} balance={balance} />
          </div>
        )}
      </section>
    </div>
  );
}
