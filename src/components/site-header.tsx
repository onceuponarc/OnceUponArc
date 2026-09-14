"use client";

import Link from "next/link";
import { SignInButton } from "@/components/sign-in-button";
import { NetworkChip } from "@/components/arc/devnet-wallet";
import { BrandMark } from "@/components/brand-mark";
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
          <BrandMark className="size-8 rounded-md border border-white/15" />
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
          <Link href="/cards" className="transition-colors hover:text-white">
            Cards
          </Link>
          <Link href="/wallet" className="transition-colors hover:text-white">
            Wallet
          </Link>
          <Link href="/tools" className="transition-colors hover:text-white">
            Tools
          </Link>
          <Link href="/params" className="transition-colors hover:text-white">
            Token
          </Link>
          <Link href="/week" className="transition-colors hover:text-white">
            Week
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
