export const OFFICIAL_TOKEN = {
  name: "OnceUpon official token",
  ticker: null as string | null,
  status: "not_live" as const,
  liveRule:
    "OnceUpon’s official token is not live. No contract address is published on this site. When the chain is live, the CA will be posted only from official OnceUpon channels: X @onceuponarc, t.me/onceuponupdates, and t.me/onceuponarc.",
  channels: [
    { label: "X", href: "https://x.com/onceuponarc" },
    { label: "Updates", href: "https://t.me/onceuponupdates" },
    { label: "Community", href: "https://t.me/onceuponarc" },
  ],
} as const;

/** Creator-fee slice only. Shares lock at 10,000 bps. */
export const FEE_WATERFALL = [
  {
    id: "dev",
    label: "Development + marketing",
    share: "75%",
    bps: 7500,
    job: "Build OnceUpon. Ops, ads, infra.",
  },
  {
    id: "burn",
    label: "Official token buyback + burn",
    share: "8%",
    bps: 800,
    job: "Market-buy the official token and burn. Not live until CA is posted.",
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
    job: "Buy the week's winning Chapter and burn it.",
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
