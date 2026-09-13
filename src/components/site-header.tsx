"use client";

import Link from "next/link";
import { SignInButton } from "@/components/sign-in-button";
import { NetworkChip } from "@/components/arc/devnet-wallet";
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
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md border border-white/20 bg-white font-mono text-[11px] font-bold text-black">
            1
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">OnceUpon</span>
          <span className="hidden rounded-md border border-white/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/70 sm:inline">
            Arc
          </span>
        </Link>
        <nav className="ml-3 hidden items-center gap-4 text-sm text-white/55 md:flex">
          <Link href="/" className="transition-colors hover:text-white">
            Board
          </Link>
          <Link href="/launch/arc" className="transition-colors hover:text-white">
            Launch
          </Link>
          <Link href="/wallet" className="transition-colors hover:text-white">
            Wallet
          </Link>
          <Link href="/tools" className="transition-colors hover:text-white">
            Tools
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <p className="hidden font-mono text-[11px] text-white/35 lg:block">{onlineCount} online</p>
          <NetworkChip />
          <SignInButton profile={profile} />
        </div>
      </div>
    </header>
  );
}
