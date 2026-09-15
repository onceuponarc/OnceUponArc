export const OFFICIAL_TOKEN = {
  name: "OrbitX",
  ticker: "ORBITX",
  status: "live" as const,
  mint: "13H4WJvGEg4xrrBwWn2vsQgz7xhmhxgNdw19i1QsxPX9",
  chain: "solana",
  liveRule:
    "Ignore anywhere else. Anyone posting a mint, “stealth CA,” or “official ticker live” outside X @orbitx_wrld and the Telegram rooms is not us. $ORBITX CA is posted below.",
  buyUrl: "https://jup.ag/swap/SOL-13H4WJvGEg4xrrBwWn2vsQgz7xhmhxgNdw19i1QsxPX9",
  chartUrl: "https://dexscreener.com/solana/13H4WJvGEg4xrrBwWn2vsQgz7xhmhxgNdw19i1QsxPX9",
  channels: [
    { label: "X", href: "https://x.com/orbitx_wrld" },
    { label: "Updates", href: "https://t.me/onceuponupdates" },
    { label: "Telegram", href: "https://t.me/onceuponarc" },
    { label: "Chart", href: "https://dexscreener.com/solana/13H4WJvGEg4xrrBwWn2vsQgz7xhmhxgNdw19i1QsxPX9" },
    { label: "Buy", href: "https://jup.ag/swap/SOL-13H4WJvGEg4xrrBwWn2vsQgz7xhmhxgNdw19i1QsxPX9" },
    { label: "Solscan", href: "https://solscan.io/token/13H4WJvGEg4xrrBwWn2vsQgz7xhmhxgNdw19i1QsxPX9" },
  ],
} as const;

/** Creator-fee slice only. Shares lock at 10,000 bps. */
export const FEE_WATERFALL = [
  {
    id: "dev",
    label: "Development + marketing",
    share: "75%",
    bps: 7500,
    job: "Build OrbitX. Ops, ads, infra.",
  },
  {
    id: "burn",
    label: "Official token buyback + burn",
    share: "8%",
    bps: 800,
    job: "Market-buy $ORBITX and burn.",
  },
  {
    id: "team",
    label: "Team",
    share: "6%",
    bps: 600,
    job: "Vested team treasury. Not a hot wallet.",
  },
  {
    id: "rewards",
    label: "Rewards pool",
    share: "6%",
    bps: 600,
    job: "Holder and pad rewards.",
  },
  {
    id: "weekly",
    label: "Weekly best-launch burn",
    share: "5%",
    bps: 500,
    job: "Buy the week's winning launch and burn it.",
  },
] as const;

export const FEE_WATERFALL_BPS = FEE_WATERFALL.reduce((sum, row) => sum + row.bps, 0);

export function exampleDay(volumeUsd = 100_000, creatorFeePct = 0.3) {
  const pot = volumeUsd * (creatorFeePct / 100);
  return FEE_WATERFALL.map((row) => ({
    ...row,
    usd: (pot * row.bps) / 10_000,
  }));
}
