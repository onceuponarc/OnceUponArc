"use client";

import { useEffect, useState } from "react";

const KEY = "onceupon-watch";

export function readWatch(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

export function WatchButton({ slug }: { slug: string }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOn(readWatch().includes(slug));
  }, [slug]);

  function toggle(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    const next = on ? readWatch().filter((id) => id !== slug) : [...readWatch(), slug];
    localStorage.setItem(KEY, JSON.stringify(next));
    setOn(!on);
    window.dispatchEvent(new Event("onceupon-watch"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`rounded-full border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
        on ? "border-white bg-white text-black" : "border-white/20 text-white/50"
      }`}
    >
      {on ? "Watching" : "Watch"}
    </button>
  );
}
