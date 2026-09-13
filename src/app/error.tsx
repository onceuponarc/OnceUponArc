"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const aborted =
    /destination stream closed early|aborted|failed to fetch/i.test(error.message ?? "") ||
    /destination stream closed early/i.test(error.digest ?? "");

  return (
    <div className="glass mx-auto max-w-lg space-y-4 rounded-3xl border border-gold/25 p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">OnceUpon</p>
      <h1 className="font-heading text-3xl font-bold">
        {aborted ? "Preview interrupted" : "This page could not finish"}
      </h1>
      <p className="text-parchment/70">
        {aborted
          ? "The request closed before the pad answered. Reload and sign in with X if you were mid-login."
          : error.message || "A server error occurred. Reload to try again."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink"
      >
        Try again
      </button>
    </div>
  );
}
