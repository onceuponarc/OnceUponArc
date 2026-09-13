"use client";

import { usePathname } from "next/navigation";
import { JupiterSwapPanel } from "@/components/jupiter/swap-panel";

export function PadJupiterDock({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/auth") || pathname.startsWith("/story/")) return null;

  return (
    <div className="mt-10">
      <JupiterSwapPanel signedIn={signedIn} />
    </div>
  );
}
