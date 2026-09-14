"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ShelfGate({ handle }: { handle: string | null }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(handle ? `/u/${handle}` : "/onceuponers");
  }, [handle, router]);

  return (
    <div className="glass mx-auto max-w-lg rounded-3xl border border-gold/25 p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Shelf</p>
      <h1 className="font-heading mt-2 text-2xl font-bold">Opening your shelf</h1>
      <p className="mt-2 text-sm text-parchment/70">
        {handle ? `Taking you to @${handle}.` : "Sign in with X to open your own shelf. Showing the crew instead."}
      </p>
    </div>
  );
}
