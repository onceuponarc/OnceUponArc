import { cn } from "@/lib/utils";

export function CurveMeter({
  progressBps,
  graduated,
  className,
}: {
  progressBps: number;
  graduated?: boolean;
  className?: string;
}) {
  const pct = graduated ? 100 : Math.max(0, Math.min(100, progressBps / 100));
  return (
    <div className={cn("space-y-1", className)}>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full", graduated ? "bg-white" : "bg-gradient-to-r from-emerald-400 to-white")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
        {graduated ? "Bonded" : `${pct.toFixed(0)}% to graduate`}
      </p>
    </div>
  );
}
