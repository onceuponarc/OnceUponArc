"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MARKET_EVENT } from "@/lib/live-market";

export function LiveRefresh({ intervalMs = 4000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => router.refresh();
    const timer = window.setInterval(tick, intervalMs);
    window.addEventListener(MARKET_EVENT, tick);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(MARKET_EVENT, tick);
    };
  }, [intervalMs, router]);

  return null;
}
