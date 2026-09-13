#!/usr/bin/env node
/** Keep local Anvil + Chapter Factory alive for the pad. */
import { ensureDevnet } from "./arc-devnet.mjs";

const INTERVAL_MS = Number(process.env.ARC_WATCHDOG_MS || 8000);

async function tick() {
  try {
    await ensureDevnet();
  } catch (error) {
    console.error("[arc-watchdog]", error instanceof Error ? error.message : error);
  }
}

await tick();
setInterval(() => {
  void tick();
}, INTERVAL_MS);
