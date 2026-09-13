"use client";

import Link from "next/link";
import { SignInButton } from "@/components/sign-in-button";
import { SolanaConnectButton } from "@/components/wallet/connect-button";
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
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="font-heading text-lg font-bold tracking-tight text-parchment sm:text-xl">
            OnceUpon
          </span>
          <span className="rounded-full border border-arc/35 bg-arc/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-arc">
            Arc
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <p className="hidden text-[11px] text-parchment/45 md:block">{onlineCount} online</p>
          <SolanaConnectButton compact />
          <SignInButton profile={profile} />
        </div>
      </div>
    </header>
  );
}
