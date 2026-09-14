"use client";

export function LivePulse() {
  return (
    <div className="flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
      </span>
      Live desk · 2s tape
    </div>
  );
}
