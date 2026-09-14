"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { readApiJson } from "@/lib/http/read-json";

type Desk = {
  wallets?: { solana: string | null; eth: string | null; arc?: string | null };
};

export function DevFundBanner({ chain }: { chain: "arc" | "solana" }) {
  const [desk, setDesk] = useState<Desk | null>(null);
  useEffect(() => {
    fetch("/api/wallets/desk", { cache: "no-store" })
      .then((res) => readApiJson<Desk>(res))
      .then(setDesk)
      .catch(() => setDesk(null));
  }, []);
  const address = chain === "solana" ? desk?.wallets?.solana : desk?.wallets?.eth ?? desk?.wallets?.arc;
  return (
    <section className="rounded-2xl border border-white/10 p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">In-app dev wallet</p>
      <p className="mt-2 text-sm text-white/60">
        Do not connect Phantom or MetaMask to launch. This account already has a wallet. Send{" "}
        {chain === "solana" ? "SOL" : "USDC on Arc"} to it. That balance pays gas and is the address that receives
        trading fees.
      </p>
      <p className="mt-3 break-all font-mono text-xs text-white">{address ?? "Sign in to create your desk."}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/wallet">Fund wallet</Link>
        </Button>
      </div>
    </section>
  );
}
