"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const KEY = "onceupon:x-follows";

function readFollows(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function FollowXButton({ handle }: { handle: string }) {
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setFollowing(readFollows().includes(handle.toLowerCase()));
  }, [handle]);

  async function follow() {
    if (following || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/x/follow", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ handle }),
      });
      const data = (await res.json()) as { ok?: boolean; via?: string; intent?: string };
      if (data.intent && data.via !== "api") {
        window.open(data.intent, "onceupon-x-follow", "popup,width=520,height=640");
      }
      const next = Array.from(new Set([...readFollows(), handle.toLowerCase()]));
      localStorage.setItem(KEY, JSON.stringify(next));
      setFollowing(true);
    } catch {
      window.open(`https://x.com/intent/follow?screen_name=${encodeURIComponent(handle)}`, "_blank");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={() => void follow()} disabled={busy || following}>
      {following ? "Following on X" : busy ? "Following…" : "Follow on X"}
    </Button>
  );
}
