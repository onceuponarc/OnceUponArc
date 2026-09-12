"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="glass mx-auto max-w-lg space-y-4 rounded-3xl border border-gold/25 p-8">
      <h1 className="font-heading text-3xl font-bold">Something broke</h1>
      <p className="text-parchment/70">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
