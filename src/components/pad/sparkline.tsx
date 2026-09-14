import { cn } from "@/lib/utils";

export function Sparkline({
  points,
  up,
  className,
}: {
  points: number[];
  up?: boolean;
  className?: string;
}) {
  const series = points.length >= 2 ? points : [1, 1];
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((value, i) => {
    const x = (i / (series.length - 1)) * 100;
    const y = 24 - ((value - min) / span) * 20 - 2;
    return [x, y] as const;
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const fill = `${d} L100 24 L0 24 Z`;
  const color = up === false ? "#ef4444" : "#22c55e";
  return (
    <svg viewBox="0 0 100 24" className={cn("h-8 w-24 overflow-visible", className)} preserveAspectRatio="none">
      <path d={fill} fill={up === false ? "rgba(239,68,68,0.16)" : "rgba(34,197,94,0.16)"} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
