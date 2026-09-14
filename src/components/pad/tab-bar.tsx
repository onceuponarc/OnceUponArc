"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers3, Rocket, Sparkles, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; icon: typeof Home; match: string }[] = [
  { href: "/", label: "Board", icon: Home, match: "/" },
  { href: "/launch", label: "Launch", icon: Rocket, match: "/launch" },
  { href: "/cards", label: "Cards", icon: Layers3, match: "/cards" },
  { href: "/drop", label: "Drop", icon: Sparkles, match: "/drop" },
  { href: "/you", label: "You", icon: UserRound, match: "/you" },
];

export function TabBar() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(10px,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="glass-tab pointer-events-auto flex w-full max-w-[440px] items-stretch justify-between rounded-full border border-white/10 px-1.5 py-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active =
            tab.match === "/"
              ? pathname === "/"
              : pathname === tab.href || pathname === tab.match || pathname.startsWith(`${tab.match}/`);
          const launch = tab.match === "/launch";
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-1 py-1 text-[10px] font-medium transition-colors",
                active ? "text-white" : "text-white/40 hover:text-white",
              )}
            >
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full transition",
                  active && launch && "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.25)]",
                  active && !launch && "bg-white/12",
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
