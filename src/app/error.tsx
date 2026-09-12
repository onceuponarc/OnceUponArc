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
    <div className="space-y-3">
      <h1 className="font-heading text-3xl">A page tore</h1>
      <p className="text-parchment/70">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
