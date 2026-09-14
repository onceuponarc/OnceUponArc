import "server-only";

import BN from "bn.js";
import { ComputeBudgetProgram, PublicKey, Transaction } from "@solana/web3.js";
import { OnlinePumpSdk, PUMP_SDK } from "@pump-fun/pump-sdk";
import { SOLANA } from "@onceupon/config/solana";
import { solanaConnection } from "@/lib/solana/connection";

export const USDC_MINT = new PublicKey(SOLANA.usdcMint);

export type PoolPairChoice = "sol" | "usdc" | "custom";

let sdkInstance: OnlinePumpSdk | null = null;
export function onlinePumpSdk(): OnlinePumpSdk {
  if (!sdkInstance) sdkInstance = new OnlinePumpSdk(solanaConnection());
  return sdkInstance;
}

/** Resolves the "Pool pair" choice from the launch form into a quote mint. `undefined` means SOL. */
export function parseQuoteMintChoice(choice: PoolPairChoice, customMint?: string): PublicKey | undefined {
  if (choice === "sol") return undefined;
  if (choice === "usdc") return USDC_MINT;
  const trimmed = (customMint ?? "").trim();
  if (!trimmed) throw new Error("Paste a mint address for the custom pool pair.");
  try {
    return new PublicKey(trimmed);
  } catch {
    throw new Error("That custom pair isn't a valid Solana mint address.");
  }
}

function budgetIxs(units: number, microLamports: number) {
  return [
    ComputeBudgetProgram.setComputeUnitLimit({ units }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports }),
  ];
}

/**
 * Builds the pump.fun create_v2 transaction directly against the on-chain program
 * (bypassing PumpPortal's wrapper, which doesn't expose Mayhem Mode, holder rewards,
 * custom quote pairs, or per-coin creator fee bps).
 */
export async function buildCreateV2Tx(opts: {
  mint: PublicKey;
  name: string;
  symbol: string;
  uri: string;
  payer: PublicKey;
  mayhemMode: boolean;
  holderReward: boolean;
  /** Desired creator fee in basis points (0-300 = up to 3%). Only takes effect on a
   *  custom (QuoteControl-admitted) quote pair — the program ignores it on SOL/USDC
   *  and uses the standard pump-fees schedule there. */
  creatorFeeBps: number;
  /** undefined = SOL */
  quoteMint?: PublicKey;
}) {
  const sdk = onlinePumpSdk();
  const global = await sdk.fetchGlobal();

  if (opts.mayhemMode && !global.mayhemModeEnabled) {
    throw new Error("Mayhem Mode is currently disabled on pump.fun.");
  }
  if (opts.holderReward && !global.isHolderRewardEnabled) {
    throw new Error("Holder rewards are currently disabled on pump.fun.");
  }

  const resolved = await sdk.resolveQuoteMint(opts.quoteMint).catch(() => {
    throw new Error("That custom pair isn't a whitelisted pump.fun quote mint.");
  });

  if (opts.mayhemMode && resolved.source === "quoteControl") {
    throw new Error("Mayhem Mode is only available with SOL or USDC pairs.");
  }

  let creatorFeeBps: BN | undefined;
  if (opts.creatorFeeBps > 0 && resolved.source === "quoteControl") {
    if (!global.creatorFeeConfigurable) {
      throw new Error("Custom creator fees aren't enabled on pump.fun right now.");
    }
    const ceiling = Number(global.maxConfigurableCreatorFeeBps?.toString() ?? "0") || 300;
    const cap = Math.min(300, ceiling);
    creatorFeeBps = new BN(Math.max(1, Math.min(cap, Math.round(opts.creatorFeeBps))));
  }

  const instruction = await PUMP_SDK.createV2Instruction({
    mint: opts.mint,
    name: opts.name,
    symbol: opts.symbol,
    uri: opts.uri,
    creator: opts.payer,
    user: opts.payer,
    mayhemMode: opts.mayhemMode,
    cashback: false,
    quoteMint: opts.quoteMint,
    quoteTokenProgram: resolved.source === "sol" ? undefined : resolved.quoteTokenProgram,
    creatorFeeBps,
    holderReward: opts.holderReward,
  });

  const heavy = resolved.source !== "sol" && opts.mayhemMode;
  const tx = new Transaction().add(...budgetIxs(heavy ? 500_000 : 300_000, 50_000), instruction);

  return {
    tx,
    quoteSource: resolved.source,
    quoteDecimals: resolved.decimals,
    appliedCreatorFeeBps: creatorFeeBps ? creatorFeeBps.toNumber() : 0,
  };
}
