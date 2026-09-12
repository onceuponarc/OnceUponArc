import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const FORBIDDEN = ["Disney shares", "official NVIDIA stock", "guaranteed yield"];
const ROOTS = ["src", "packages", "docs", "supabase"];

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === "out") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx|md|sql|mjs)$/.test(name) && !full.endsWith("copy.ts")) acc.push(full);
  }
  return acc;
}

const files = ROOTS.flatMap((root) => {
  try {
    return walk(join(process.cwd(), root));
  } catch {
    return [];
  }
});

const hits = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const phrase of FORBIDDEN) {
    if (text.includes(phrase)) hits.push(`${file}: "${phrase}"`);
  }
}

if (hits.length) {
  console.error("Forbidden offering copy found:\n" + hits.join("\n"));
  process.exit(1);
}

console.log(`Copy fence clean across ${files.length} files.`);
