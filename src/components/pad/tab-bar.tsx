"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, Home, Rocket, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/launch/arc", label: "Launch", icon: Rocket, match: "/launch" },
  { href: "/wallet", label: "Wallet", icon: ArrowLeftRight },
  { href: "/tools", label: "Tools", icon: Sparkles, match: "/tools" },
  { href: "/you", label: "You", icon: UserRound },
] as const;

export function TabBar() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(10px,env(safe-area-inset-bottom))]"
    >
      <div className="glass-tab pointer-events-auto flex w-full max-w-[420px] items-stretch justify-between rounded-full border border-white/10 px-1.5 py-1.5 sm:max-w-md">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active =
            tab.href === "/"
              ? pathname === "/"
              : "match" in tab && tab.match
                ? pathname.startsWith(tab.match)
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const launch = tab.href === "/launch/arc";
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1.5 text-[10px] font-medium transition-colors",
                active ? "text-white" : "text-white/45 hover:text-white",
              )}
            >
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-full transition",
                  active && launch && "bg-white text-black",
                  active && !launch && "bg-white/10",
                  !active && launch && "bg-white/5",
                )}
              >
                <Icon className="size-4" strokeWidth={2.1} />
              </span>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
