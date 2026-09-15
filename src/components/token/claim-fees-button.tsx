"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { readApiJson } from "@/lib/http/read-json";

export function ClaimFeesButton({ signedIn }: { signedIn: boolean }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ explorer: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/solana/claim", { method: "POST" });
      const body = await readApiJson<{ error?: string; explorer?: string }>(res);
      if (!res.ok || !body.explorer) throw new Error(body.error ?? "Nothing to claim right now.");
      setResult({ explorer: body.explorer });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!signedIn) return null;

  return (
    <div className="space-y-1.5">
      <Button type="button" size="sm" variant="outline" onClick={() => void claim()} disabled={busy}>
        {busy ? "Claiming…" : "Claim my pump.fun creator fees"}
      </Button>
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {result ? (
        <p className="text-xs text-emerald-400">
          Claimed —{" "}
          <a href={result.explorer} target="_blank" rel="noreferrer" className="underline">
            view tx
          </a>
        </p>
      ) : null}
    </div>
  );
}
