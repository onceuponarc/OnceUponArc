"use client";

import { V4LaunchStudio } from "@/components/launch/v4-launch-studio";
import type { PrintableChain } from "@onceupon/config/solana";

export function LaunchStudio({
  handle,
}: {
  chain: PrintableChain;
  handle: string | null;
  signedIn: boolean;
}) {
  return <V4LaunchStudio handle={handle} />;
}
