import Link from "next/link";
import { cn } from "@/lib/utils";

const LANES = [
  { href: "/launch/arc", label: "Arc Devnet" },
  { href: "/launch/arc-mainnet", label: "Arc Friday" },
  { href: "/launch/solana", label: "Solana" },
];

export function LaunchChainSwitch({ current }: { current: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {LANES.map((lane) => (
        <Link
          key={lane.href}
          href={lane.href}
          className={cn(
            "rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em]",
            current === lane.href ? "border-white bg-white text-black" : "border-white/15 text-white/60",
          )}
        >
          {lane.label}
        </Link>
      ))}
    </div>
  );
}
