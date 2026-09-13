"use client";

import { SolanaConnectButton } from "@/components/wallet/connect-button";
import { useSolanaWallet } from "@/components/wallet/solana-wallet-provider";
import { Badge } from "@/components/ui/badge";

export function ConnectedWalletCard({
  signedIn,
}: {
  signedIn: boolean;
}) {
  const { address, error } = useSolanaWallet();

  return (
    <section className="glass rounded-2xl border border-arc/20 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-arc">Solana wallet</p>
          <h2 className="font-heading mt-1 text-xl font-bold">Connect to launch and trade</h2>
          <p className="mt-1 max-w-lg text-sm text-parchment/65">
            Phantom, Solflare, or Backpack. Sign in with X for identity, then bind this address in Supabase by
            approving the connect message. Your wallet signs and pays rent. There is no in-app keypair.
          </p>
        </div>
        <SolanaConnectButton />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        {address ? (
          <>
            <Badge>{address.slice(0, 4)}…{address.slice(-4)}</Badge>
            <a
              className="text-arc hover:underline"
              href={`https://explorer.solana.com/address/${address}`}
              target="_blank"
              rel="noreferrer"
            >
              Explorer
            </a>
          </>
        ) : (
          <p className="text-parchment/60">No wallet connected.</p>
        )}
        {!signedIn ? <p className="text-parchment/55">Sign in with X to bind the address to your handle.</p> : null}
      </div>
      {error ? <p className="mt-2 text-sm text-burgundy">{error}</p> : null}
    </section>
  );
}
