import { PROTOCOL } from "./arc";
import { PUBLIC_SITE_URL } from "./urls";
import type { LaunchVenue } from "./solana";
import type { DexId } from "./pools";

export const PAD_NAME = "OnceUpon";
export const PAD_URL = PUBLIC_SITE_URL;
export const PAD_CREATED_ON = PUBLIC_SITE_URL;
export const PAD_TAG = `Launched on ${PAD_NAME}.`;

export const TOKEN_METADATA_PROGRAM = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";

export const PUMPSWAP = {
  name: "PumpSwap",
  programId: "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA",
  website: "https://swap.pump.fun",
  docsFees: "https://pump.fun/docs/fees",
} as const;

/** Pump.fun’s own bonding-curve schedule (reference only — OnceUpon does not take these cuts). */
export const PUMPFUN_CURVE_REFERENCE = {
  creatorBps: 30,
  protocolBps: 95,
  lpBps: 0,
  totalBps: 125,
} as const;

export type VenueFees = {
  protocolBps: number;
  authorBps: number;
  snipeTaxBps: number;
  lpBps: number;
  headline: string;
  note: string;
};

export function feesForVenue(venue: LaunchVenue, engine: "author" | "onceuponers"): VenueFees {
  if (venue === "pumpfun") {
    return {
      protocolBps: PROTOCOL.protocolBpsDefault,
      authorBps: 30,
      snipeTaxBps: 200,
      lpBps: 0,
      headline: "PumpSwap-paired SPL on the OnceUpon curve",
      note: "This is a real SPL mint. 0.30% creator + 0.20% protocol on OnceUpon’s curve. The linked AMM is PumpSwap (pAMMBay6…), not the Pump.fun program. Pump.fun’s own curve (0.30% + 0.95%) is reference only.",
    };
  }
  if (venue === "pons") {
    return {
      protocolBps: PROTOCOL.protocolBpsDefault,
      authorBps: 50,
      snipeTaxBps: 200,
      lpBps: 0,
      headline: "Pons-style pair fees",
      note: "Author cut plus 0.20% protocol on the OnceUpon curve. Snipe tax applies the first 15 minutes. Link a Pons pool on Robinhood Chain when that is the destination.",
    };
  }
  return {
    protocolBps: PROTOCOL.protocolBpsDefault,
    authorBps: engine === "onceuponers" ? 100 : PROTOCOL.authorModeSuggestedBps,
    snipeTaxBps: 0,
    lpBps: 0,
    headline: "OnceUpon SPL fees",
    note: "Author mode pushes your cut to your wallet on every buy and sell. Holder-claim mode takes only the 0.20% protocol cut on trades — you fund the holder pool yourself.",
  };
}

export function metadataDescription(blurb: string, handle?: string | null) {
  const pitch = blurb.trim();
  const by = handle ? ` Author @${handle.replace(/^@/, "")}.` : "";
  if (!pitch) return `${PAD_TAG}${by}`.trim();
  if (pitch.toLowerCase().includes("launched on onceupon")) return pitch;
  return `${pitch}\n\n${PAD_TAG}${by}`;
}

export function tokenMetadataUri(mint: string) {
  return `${PAD_URL}/api/token/${mint}/metadata`;
}

export function launchExplorerLinks(mint: string) {
  return {
    solscan: `https://solscan.io/token/${mint}`,
    explorer: `https://explorer.solana.com/address/${mint}`,
    dexscreener: `https://dexscreener.com/solana/${mint}`,
    jupiter: `https://jup.ag/swap/SOL-${mint}`,
    birdeye: `https://birdeye.so/token/${mint}?chain=solana`,
    pumpswap: `${PUMPSWAP.website}/?inputMint=So11111111111111111111111111111111111111112&outputMint=${mint}`,
    metadata: tokenMetadataUri(mint),
  };
}

export function preferDexForVenue(venue: LaunchVenue): DexId | null {
  if (venue === "pumpfun") return "pumpswap";
  if (venue === "pons") return "pons";
  return null;
}

export function venueLabel(venue: string | null | undefined) {
  if (venue === "pumpfun") return "PumpSwap pair";
  if (venue === "pons") return "Pons pair";
  if (venue === "nft") return "NFT";
  return "SPL";
}
