"use client";

import Link from "next/link";
import { SignInButton } from "@/components/sign-in-button";
import { SolanaConnectButton } from "@/components/wallet/connect-button";
import { ArcDevnetWallet } from "@/components/arc/devnet-wallet";
import type { OnceUponer } from "@/lib/auth";

export function SiteHeader({
  profile,
  onlineCount,
}: {
  profile: OnceUponer | null;
  onlineCount: number;
}) {
  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg border border-arc/40 bg-arc/15 font-heading text-xs font-extrabold text-arc">
            1
          </span>
          <span className="font-heading text-lg font-bold tracking-tight text-parchment sm:text-xl">
            OnceUpon
          </span>
          <span className="rounded-full border border-arc/35 bg-arc/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-arc">
            Arc
          </span>
        </Link>
        <nav className="ml-4 hidden items-center gap-3 text-sm text-parchment/60 md:flex">
          <Link href="/" className="hover:text-parchment">
            Board
          </Link>
          <Link href="/launch/arc" className="hover:text-parchment">
            Launch
          </Link>
          <Link href="/wallet" className="hover:text-parchment">
            Trade
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <p className="hidden text-[11px] text-parchment/45 lg:block">{onlineCount} online</p>
          <ArcDevnetWallet compact />
          <SolanaConnectButton compact />
          <SignInButton profile={profile} />
        </div>
      </div>
    </header>
  );
}
