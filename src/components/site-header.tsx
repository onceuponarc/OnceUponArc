import Link from "next/link";
import { SignInButton } from "@/components/sign-in-button";
import { WalletBar } from "@/components/wallet-bar";
import type { OnceUponer } from "@/lib/auth";

const NAV = [
  { href: "/", label: "The Desk" },
  { href: "/write", label: "The Press" },
  { href: "/wallet", label: "Wallet" },
  { href: "/chapter/the-first-chapter", label: "The First Chapter" },
  { href: "/ledger", label: "The Ledger" },
  { href: "/margin", label: "The Margin" },
  { href: "/onceuponers", label: "OnceUponers" },
];

export function SiteHeader({
  profile,
  onlineCount,
}: {
  profile: OnceUponer | null;
  onlineCount: number;
}) {
  return (
    <header className="border-b border-gold/20 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-baseline gap-3">
          <Link href="/" className="font-heading text-2xl tracking-tight text-parchment">
            OnceUpon
          </Link>
          <span className="hidden text-xs uppercase tracking-[0.2em] text-gold/80 sm:inline">
            on Arc
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-parchment/80">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-gold">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <p className="text-xs text-parchment/60">
            {onlineCount} OnceUponers in the book
          </p>
          <WalletBar />
          <SignInButton profile={profile} />
        </div>
      </div>
    </header>
  );
}
