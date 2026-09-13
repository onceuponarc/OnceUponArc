"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyCa({ mint }: { mint: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={async () => {
        await navigator.clipboard.writeText(mint);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }}
    >
      {copied ? "Copied" : "Copy CA"}
    </Button>
  );
}
