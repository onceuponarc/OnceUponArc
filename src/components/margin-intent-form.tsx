"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function MarginIntentForm() {
  const [market, setMarket] = useState("BTC-PERP");
  const [side, setSide] = useState<"long" | "short">("long");
  const [size, setSize] = useState("100");
  const [note, setNote] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const res = await fetch("/api/margin/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        market,
        side,
        sizeUsd: Number(size),
        leverage: 1,
      }),
    });
    const body = await res.json();
    setNote(res.ok ? "Intent recorded. Jupiter still holds the risk." : body.error);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">Record intent</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-4">
          <div className="space-y-1">
            <Label>Market</Label>
            <Input value={market} onChange={(e) => setMarket(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Side</Label>
            <div className="flex gap-2">
              <Button type="button" variant={side === "long" ? "default" : "outline"} onClick={() => setSide("long")}>
                Long
              </Button>
              <Button type="button" variant={side === "short" ? "default" : "outline"} onClick={() => setSide("short")}>
                Short
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Size USD</Label>
            <Input type="number" min={1} value={size} onChange={(e) => setSize(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="submit">Save intent</Button>
          </div>
        </form>
        {note ? <p className="mt-3 text-sm text-parchment/70">{note}</p> : null}
      </CardContent>
    </Card>
  );
}
