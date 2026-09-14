"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ShareChapter({ ticker, slug }: { ticker: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = `${window.location.origin}/story/${slug}/share`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `$${ticker} on OrbitX`, url });
        return;
      }
    } catch {
      /* clipboard */
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Button variant="outline" onClick={() => void share()}>
      {copied ? "Copied" : "Share Chapter"}
    </Button>
  );
}
