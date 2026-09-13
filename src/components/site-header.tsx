"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { SignInButton } from "@/components/sign-in-button";
import { PadWalletChip } from "@/components/wallet/pad-wallet-chip";
import type { OnceUponer } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/launch", label: "Launch" },
  { href: "/wallet", label: "Trade" },
  { href: "/ledger", label: "Claims" },
  { href: "/onceuponers", label: "Crew" },
];

const MORE = [
  { href: "/bindings", label: "Bindings" },
  { href: "/margin", label: "Margin" },
  { href: "/chapter/the-first-chapter", label: "First Chapter" },
];

function NavLinks({
  onNavigate,
  pathname,
}: {
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <>
      {NAV.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition",
              active
                ? "bg-gold/15 text-gold"
                : "text-parchment/75 hover:bg-white/5 hover:text-gold",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function SiteHeader({
  profile,
  onlineCount,
}: {
  profile: OnceUponer | null;
  onlineCount: number;
}) {
  const pathname = usePathname();

  return (
    <header className="glass-nav sticky top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2">
        <Link href="/" className="flex min-w-0 items-baseline gap-2">
          <span className="font-heading text-xl font-bold tracking-tight text-parchment sm:text-2xl">
            OnceUpon
          </span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-gold/85 sm:inline">
            Launchpad
          </span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          <NavLinks pathname={pathname} />
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <p className="hidden text-[11px] text-parchment/55 md:block">
            {onlineCount} online
          </p>
          <PadWalletChip signedIn={Boolean(profile)} />
          <SignInButton profile={profile} />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass border-gold/20">
              <SheetHeader>
                <SheetTitle className="font-heading">OnceUpon</SheetTitle>
                <SheetDescription>Navigate the launchpad.</SheetDescription>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-2">
                <NavLinks pathname={pathname} />
                {MORE.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-full px-3 py-1.5 text-sm text-parchment/75 hover:text-gold"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
