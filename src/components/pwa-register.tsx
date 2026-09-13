"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const url = "/sw.js";
    navigator.serviceWorker.register(url).catch(() => undefined);
  }, []);
  return null;
}
