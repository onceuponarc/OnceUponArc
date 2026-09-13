import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const FORBIDDEN = [
  '@solana/web3.js',
  '@/lib/wallets/embedded',
  '@/lib/solana/connection',
  '@/lib/solana/keys',
  '@/lib/solana/launch',
  '@/lib/solana/trade',
  '@/lib/solana/mint',
  '@/lib/solana/pumpswap-pool',
];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (name === "api") continue;
      walk(full, acc);
    } else if (name === "page.tsx" || name === "layout.tsx" || name === "error.tsx" || name === "global-error.tsx") {
      acc.push(full);
    }
  }
  return acc;
}

const files = walk(join(process.cwd(), "src/app"));
const hits = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const needle of FORBIDDEN) {
    if (text.includes(needle)) hits.push(`${file}: ${needle}`);
  }
}

if (hits.length) {
  console.error("Page/layout files must not import Solana RPC or pad-wallet secrets:\n" + hits.join("\n"));
  process.exit(1);
}

console.log(`Page bundle fence clean across ${files.length} files.`);
