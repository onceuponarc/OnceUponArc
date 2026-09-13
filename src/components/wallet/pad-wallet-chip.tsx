"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function shorten(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function PadWalletChip({ signedIn }: { signedIn: boolean }) {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!signedIn) {
      setAddress(null);
      return;
    }
    let cancelled = false;
    fetch("/api/wallets/embedded")
      .then((res) => res.json())
      .then((body) => {
        if (!cancelled && typeof body.address === "string") setAddress(body.address);
      })
      .catch(() => {
        if (!cancelled) setAddress(null);
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  if (!signedIn) return null;
  if (!address) {
    return <span className="hidden text-[11px] text-parchment/50 sm:inline">Pad wallet…</span>;
  }

  return (
    <Link
      href="/wallet"
      className="hidden rounded-md border border-gold/25 px-2 py-1 font-mono text-[11px] text-gold sm:inline"
      title="Supabase pad wallet"
    >
      {shorten(address)}
    </Link>
  );
}
