"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type PoolPairChoice = "sol" | "usdc" | "custom";
export type RewardsTarget = "creator" | "holders";

export type AdvancedLaunchValue = {
  poolPair: PoolPairChoice;
  customQuoteMint: string;
  mayhemMode: boolean;
  rewardsTo: RewardsTarget;
  creatorFeeBps: number;
};

export const DEFAULT_ADVANCED_LAUNCH: AdvancedLaunchValue = {
  poolPair: "sol",
  customQuoteMint: "",
  mayhemMode: false,
  rewardsTo: "creator",
  creatorFeeBps: 0,
};

const PAIR_OPTIONS: { id: PoolPairChoice; label: string }[] = [
  { id: "sol", label: "SOL" },
  { id: "usdc", label: "USDC" },
  { id: "custom", label: "Custom" },
];

export function AdvancedLaunchFields({
  value,
  onChange,
}: {
  value: AdvancedLaunchValue;
  onChange: (next: AdvancedLaunchValue) => void;
}) {
  function set<K extends keyof AdvancedLaunchValue>(key: K, next: AdvancedLaunchValue[K]) {
    onChange({ ...value, [key]: next });
  }

  const mayhemBlocked = value.poolPair === "custom";

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 p-4">
      <div>
        <p className="text-sm font-semibold">Send creator rewards to:</p>
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-full border border-white/10 bg-black/30 p-1">
          {(["creator", "holders"] as RewardsTarget[]).map((target) => (
            <button
              key={target}
              type="button"
              onClick={() => set("rewardsTo", target)}
              className={cn(
                "rounded-full py-2 text-sm font-medium capitalize transition-colors",
                value.rewardsTo === target ? "bg-white/15 text-white" : "text-white/50 hover:text-white/80",
              )}
            >
              {target}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-white/45">
          Holders mode routes every creator fee to a shared pool that token holders claim from instead of you.
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold">Fee percentage</p>
        <div className="mt-2 flex items-center gap-3">
          <Input
            type="number"
            min={0}
            max={3}
            step={0.1}
            value={(value.creatorFeeBps / 100).toString()}
            onChange={(e) => {
              const pct = Number(e.target.value);
              const bps = Number.isFinite(pct) ? Math.round(Math.max(0, Math.min(3, pct)) * 100) : 0;
              set("creatorFeeBps", bps);
            }}
            className="w-24"
          />
          <span className="text-sm text-white/50">% (up to 3%)</span>
        </div>
        <p className="mt-1 text-xs text-white/45">
          Only takes effect on a custom pool pair — pump.fun uses its standard fee schedule for SOL and USDC pairs.
        </p>
      </div>

      <div>
        <p className="text-sm font-semibold">Pool pair</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {PAIR_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => set("poolPair", opt.id)}
              className={cn(
                "rounded-xl border py-3 text-sm font-medium transition-colors",
                value.poolPair === opt.id
                  ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200"
                  : "border-white/10 text-white/60 hover:border-white/25",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {value.poolPair === "custom" ? (
          <Input
            className="mt-2"
            value={value.customQuoteMint}
            onChange={(e) => set("customQuoteMint", e.target.value)}
            placeholder="Custom quote mint address"
          />
        ) : null}
      </div>

      <div className="rounded-xl border border-white/10 p-3">
        <label className="flex items-center justify-between gap-3">
          <span>
            <span className="block text-sm font-semibold">Mayhem Mode</span>
            <span className="block text-xs text-white/45">Randomized bonding-curve parameters. Permanent once set.</span>
          </span>
          <input
            type="checkbox"
            checked={value.mayhemMode && !mayhemBlocked}
            disabled={mayhemBlocked}
            onChange={(e) => set("mayhemMode", e.target.checked)}
            className="size-5 shrink-0 disabled:opacity-40"
          />
        </label>
        <p className="mt-2 text-xs text-white/45">Mayhem mode is only available with SOL or USDC pairs.</p>
      </div>
    </div>
  );
}
