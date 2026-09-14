"use client";

import { useEffect, useState } from "react";

export function DropClock() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    function tick() {
      setNow(
        new Date().toLocaleString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZoneName: "short",
        }),
      );
    }
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="tabular-nums text-white/70">{now || "LIVE"}</span>;
}
