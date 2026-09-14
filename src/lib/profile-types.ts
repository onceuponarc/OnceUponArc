export type ProfileLaunch = {
  slug: string;
  title: string;
  ticker: string;
  status: string;
  coverUrl: string | null;
  authorBps: number;
  volumeUi: number;
  feesUi: number;
  trades: number;
};

export type ProfileHold = {
  slug: string;
  ticker: string;
  tokens: number;
  spentUi: number;
  receivedUi: number;
};

export type ProfileFill = {
  slug: string;
  ticker: string;
  side: "buy" | "sell";
  quoteUi: number;
  at: string;
  txHash: string | null;
};

export type ProfileDesk = {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  portraitUrl: string | null;
  bannerUrl: string | null;
  launches: ProfileLaunch[];
  holds: ProfileHold[];
  fills: ProfileFill[];
  launchCount: number;
  liveCount: number;
  graduatedCount: number;
  volumeUi: number;
  feesUi: number;
  tradedUi: number;
};
