import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function LinkButton({
  href,
  label,
  sub,
  Icon,
  className,
}: {
  href: string;
  label: string;
  sub?: string;
  Icon: LucideIcon;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-arc/40 hover:bg-arc/[0.06]",
        className,
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/70 transition-colors group-hover:border-arc/50 group-hover:text-arc">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 text-left">
        <span className="block truncate text-sm font-medium text-white">{label}</span>
        {sub ? <span className="block truncate text-[11px] text-white/40">{sub}</span> : null}
      </span>
    </a>
  );
}
