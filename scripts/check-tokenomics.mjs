function holderClaimShare(opts) {
  if (opts.reward <= 0n || opts.held <= 0n || opts.supply <= 0n) return 0n;
  const circulating = opts.supply > opts.curveTokens ? opts.supply - opts.curveTokens : 0n;
  if (circulating <= 0n || opts.held > circulating) return 0n;
  return (opts.reward * opts.held) / circulating;
}

const cases = [
  {
    name: "half circulating",
    reward: 100n,
    held: 50n,
    supply: 200n,
    curveTokens: 100n,
    expect: 50n,
  },
  {
    name: "all still on curve",
    reward: 100n,
    held: 1n,
    supply: 100n,
    curveTokens: 100n,
    expect: 0n,
  },
  {
    name: "empty vault",
    reward: 0n,
    held: 10n,
    supply: 100n,
    curveTokens: 50n,
    expect: 0n,
  },
];

let failed = 0;
for (const item of cases) {
  const got = holderClaimShare(item);
  if (got !== item.expect) {
    console.error(`${item.name}: expected ${item.expect}, got ${got}`);
    failed += 1;
  }
}

if (failed) process.exit(1);
console.log(`Holder claim share math clean across ${cases.length} cases.`);
