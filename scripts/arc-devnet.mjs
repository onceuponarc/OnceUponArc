#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const RPC = process.env.ARC_RPC_URL || "http://127.0.0.1:8546";
const PORT = Number(new URL(RPC).port || 8546);
const DATA = join(ROOT, "data");
const OUT = process.env.ARC_DEVNET_FILE || join(DATA, "arc-devnet.json");
const STATE = process.env.ARC_ANVIL_STATE || join(DATA, "anvil-state.json");
const DEPLOYER_PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const TRADER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const DEPLOYER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const FORGE = process.env.FORGE || `${process.env.HOME}/.foundry/bin/forge`;
const ANVIL = process.env.ANVIL || `${process.env.HOME}/.foundry/bin/anvil`;

async function rpc(method, params = []) {
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
  return res.json();
}

async function rpcOk() {
  try {
    const body = await rpc("eth_chainId");
    return Boolean(body.result);
  } catch {
    return false;
  }
}

async function hasCode(address) {
  if (!address) return false;
  try {
    const body = await rpc("eth_getCode", [address, "latest"]);
    return typeof body.result === "string" && body.result.length > 4;
  } catch {
    return false;
  }
}

function readNetwork() {
  if (!existsSync(OUT)) return null;
  try {
    return JSON.parse(readFileSync(OUT, "utf8"));
  } catch {
    return null;
  }
}

function startAnvil() {
  mkdirSync(DATA, { recursive: true });
  const args = [
    "--host",
    "127.0.0.1",
    "--port",
    String(PORT),
    "--chain-id",
    "31337",
    "--block-time",
    "1",
    "--state",
    STATE,
    "--state-interval",
    "15",
  ];
  const child = spawn(ANVIL, args, { detached: true, stdio: "ignore" });
  child.unref();
}

function parseAddr(log, label) {
  const line = log.split("\n").find((row) => row.includes(label));
  const match = line?.match(/0x[a-fA-F0-9]{40}/);
  if (!match) throw new Error(`Could not parse ${label} from forge output.`);
  return match[0];
}

function writeNetwork(factory, usdc) {
  const payload = {
    label: "Arc Devnet",
    rpcUrl: RPC,
    chainId: 31337,
    factory,
    usdc,
    trader: TRADER,
    deployer: DEPLOYER,
    explorer: RPC,
    nativeGas: "eth",
  };
  writeFileSync(OUT, JSON.stringify(payload, null, 2));
  return payload;
}

async function deployFactory() {
  const env = {
    ...process.env,
    PRIVATE_KEY: DEPLOYER_PK,
    TRADER,
    PATH: `${process.env.HOME}/.foundry/bin:${process.env.PATH}`,
  };
  const result = spawnSync(
    FORGE,
    [
      "script",
      "script/DeployDevnet.s.sol:DeployDevnet",
      "--rpc-url",
      RPC,
      "--broadcast",
      "--private-key",
      DEPLOYER_PK,
      "-vv",
    ],
    { cwd: join(ROOT, "contracts"), env, encoding: "utf8" },
  );
  const log = `${result.stdout}\n${result.stderr}`;
  if (result.status !== 0) {
    console.error(log);
    throw new Error("Forge deploy failed.");
  }
  const usdc = parseAddr(log, "USDC");
  const factory = parseAddr(log, "FACTORY");
  return writeNetwork(factory, usdc);
}

export async function ensureDevnet() {
  mkdirSync(DATA, { recursive: true });
  if (!(await rpcOk())) {
    console.log(`Starting Anvil on ${RPC}…`);
    startAnvil();
    for (let i = 0; i < 80; i += 1) {
      await new Promise((r) => setTimeout(r, 250));
      if (await rpcOk()) break;
    }
    if (!(await rpcOk())) throw new Error("Anvil did not come up on 8546.");
  }

  const prev = readNetwork();
  if (prev?.factory && prev.usdc && (await hasCode(prev.factory)) && (await hasCode(prev.usdc))) {
    console.log(`Arc Devnet ready · factory ${prev.factory} · USDC ${prev.usdc}`);
    return prev;
  }

  const payload = await deployFactory();
  console.log(`Arc Devnet ready · factory ${payload.factory} · USDC ${payload.usdc}`);
  console.log(`Wrote ${OUT}`);
  return payload;
}

const isMain = import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  ensureDevnet().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
