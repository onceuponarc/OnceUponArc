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
  const d = series
    .map((value, i) => {
      const x = (i / (series.length - 1)) * 100;
      const y = 24 - ((value - min) / span) * 22 - 1;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 24" className={cn("h-8 w-24 overflow-visible", className)} preserveAspectRatio="none">
      <path
        d={d}
        fill="none"
        stroke={up === false ? "#ff4d7a" : "#00e5c3"}
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
