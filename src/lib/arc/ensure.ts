import "server-only";

import { spawn } from "node:child_process";
import { join } from "node:path";
import { loadArcNetwork, type ArcNetworkFile } from "@/lib/arc/env";

const DEFAULT_RPC = process.env.ARC_RPC_URL || "http://127.0.0.1:8546";

async function rpc(url: string, method: string, params: unknown[] = []) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
  return (await res.json()) as { result?: string };
}

export async function arcRpcLive(url = DEFAULT_RPC) {
  try {
    const body = await rpc(url, "eth_chainId");
    return Boolean(body.result);
  } catch {
    return false;
  }
}

export async function factoryHasCode(address: string, url = DEFAULT_RPC) {
  try {
    const body = await rpc(url, "eth_getCode", [address, "latest"]);
    return typeof body.result === "string" && body.result.length > 4;
  } catch {
    return false;
  }
}

function isLocalRpc(url: string) {
  try {
    const host = new URL(url).hostname;
    return host === "127.0.0.1" || host === "localhost";
  } catch {
    return false;
  }
}

function runArcDevnet() {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(process.execPath, [join(process.cwd(), "scripts/arc-devnet.mjs")], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PATH: `${process.env.HOME}/.foundry/bin:${process.env.PATH}`,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let out = "";
    child.stdout?.on("data", (chunk) => {
      out += String(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      out += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(out.trim() || `arc-devnet exited ${code}`));
    });
  });
}

let inflight: Promise<ArcNetworkFile> | null = null;

async function ensureOnce(): Promise<ArcNetworkFile> {
  const net = loadArcNetwork();
  if (
    net?.factory &&
    net.usdc &&
    (await arcRpcLive(net.rpcUrl)) &&
    (await factoryHasCode(net.factory, net.rpcUrl))
  ) {
    return net;
  }
  const rpcUrl = net?.rpcUrl || DEFAULT_RPC;
  if (!isLocalRpc(rpcUrl) || process.env.VERCEL) {
    throw new Error("Arc Devnet is not wired. Start Anvil and deploy the Chapter Factory.");
  }
  await runArcDevnet();
  const again = loadArcNetwork();
  if (
    !again?.factory ||
    !again.usdc ||
    !(await arcRpcLive(again.rpcUrl)) ||
    !(await factoryHasCode(again.factory, again.rpcUrl))
  ) {
    throw new Error("Arc Devnet is not wired. Start Anvil and deploy the Chapter Factory.");
  }
  return again;
}

/** Bring up local Anvil + Chapter Factory when the pad can. No-op if already live. */
export async function ensureArcDevnet(): Promise<ArcNetworkFile> {
  if (inflight) return inflight;
  inflight = ensureOnce().finally(() => {
    inflight = null;
  });
  return inflight;
}
