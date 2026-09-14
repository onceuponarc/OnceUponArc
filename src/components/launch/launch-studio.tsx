"use client";

import { useState } from "react";
import { ArcLaunchStudio } from "@/components/launch/arc-launch-studio";
import { SpawnDesk } from "@/components/cards/spawn-desk";
import { LaunchKindPicker, type LaunchKind } from "@/components/launch/launch-kind";
import type { PrintableChain } from "@onceupon/config/solana";

export function LaunchStudio({
  handle,
}: {
  chain: PrintableChain;
  handle: string | null;
  signedIn: boolean;
}) {
  const [kind, setKind] = useState<LaunchKind>("chapter");

  return (
    <div className="space-y-6">
      <LaunchKindPicker value={kind} onChange={setKind} />
      {kind === "chapter" || kind === "pair" ? (
        <ArcLaunchStudio handle={handle} pairCard={kind === "pair"} />
      ) : (
        <SpawnDesk handle={handle} mode={kind === "tweet" ? "tweet" : "card"} />
      )}
    </div>
  );
}
