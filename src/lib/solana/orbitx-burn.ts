import "server-only";

import BN from "bn.js";
import { Keypair, PublicKey, ComputeBudgetProgram } from "@solana/web3.js";
import { createBurnInstruction } from "@solana/spl-token";
import { OnlinePumpAmmSdk, PUMP_AMM_SDK, buyQuoteInput } from "@pump-fun/pump-swap-sdk";
import { solanaConnection } from "@/lib/solana/connection";
import { OFFICIAL_TOKEN } from "@/lib/official-token";

const ORBITX_MINT = new PublicKey(OFFICIAL_TOKEN.mint);
const ORBITX_POOL = new PublicKey("7cLiruk2Fpravgf57NQeZBMaMxzehMa74LkESh9qEhGD");
const SLIPPAGE_PCT = 8; // generous — this is a tiny, fixed-USD buy, not a trade someone is optimizing

let ammSdk: OnlinePumpAmmSdk | null = null;
function amm(): OnlinePumpAmmSdk {
  if (!ammSdk) ammSdk = new OnlinePumpAmmSdk(solanaConnection());
  return ammSdk;
}

/** Current $ORBITX price in USD per SOL-lamport terms, derived from pump.fun's
 *  own public pricing for the pool (same number the token's own chart uses).
 *  Falls back to null if the fetch fails — callers must treat that as "can't
 *  safely size this buy right now" rather than guessing. */
async function usdPerSol(): Promise<number | null> {
  try {
    const res = await fetch(`https://frontend-api-v3.pump.fun/coins/${OFFICIAL_TOKEN.mint}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { market_cap?: number; market_cap_usd?: number };
    if (!data.market_cap || !data.market_cap_usd) return null;
    return data.market_cap_usd / data.market_cap;
  } catch {
    return null;
  }
}

export async function lamportsForUsd(usd: number): Promise<number> {
  const price = await usdPerSol();
  if (!price || price <= 0) throw new Error("Could not price $ORBITX right now — try again in a moment.");
  const sol = usd / price;
  return Math.round(sol * 1_000_000_000);
}

/**
 * Builds the instructions that buy $ORBITX with `lamports` of SOL and then
 * burn everything received, as two ordinary, well-trodden operations in one
 * transaction — a standard PumpSwap buy (the same instruction path a real
 * pump.fun buy uses) followed by a standard SPL burn of the tokens it lands
 * in. This replaced an earlier version built on PumpSwap's boostBuyAndBurn
 * primitive, which turned out to always fail on-chain for this pool
 * (AccountNotInitialized on `boost_vault` — that feature was never set up
 * for $ORBITX, confirmed by inspecting a failed transaction directly on
 * Solscan) — a bug that shipped a design I hadn't actually watched succeed
 * on-chain. This version only uses instruction paths real trades already
 * exercise every day.
 *
 * The burn amount is the slippage-protected minimum from the buy (`minOut`),
 * never the optimistic estimate — the buy instruction itself guarantees at
 * least that many tokens land in the account, so the burn can never try to
 * burn more than what's actually there.
 */
export async function buildOrbitxBurnIx(payer: Keypair, lamports: number) {
  const online = amm();
  const state = await online.swapSolanaState(ORBITX_POOL, payer.publicKey);

  const quote = new BN(lamports);
  const preview = buyQuoteInput({
    quote,
    slippage: SLIPPAGE_PCT,
    baseReserve: state.poolBaseAmount,
    quoteReserve: state.poolQuoteAmount,
    virtualQuoteReserves: state.pool.virtualQuoteReserves,
    globalConfig: state.globalConfig,
    baseMintAccount: state.baseMintAccount,
    baseMint: state.baseMint,
    coinCreator: state.pool.coinCreator,
    creator: state.pool.creator,
    feeConfig: state.feeConfig,
    isMayhemMode: state.pool.isMayhemMode,
    creatorFeeBps: state.pool.creatorFeeBps,
  });
  const minOut = preview.base.muln(100 - SLIPPAGE_PCT).divn(100);

  const buyIxs = await PUMP_AMM_SDK.buyQuoteInput(state, quote, SLIPPAGE_PCT);
  const burnIx = createBurnInstruction(
    state.userBaseTokenAccount,
    state.baseMint,
    payer.publicKey,
    BigInt(minOut.toString()),
    [],
    state.baseTokenProgram,
  );

  return {
    instructions: [
      ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }),
      ...buyIxs,
      burnIx,
    ],
    expectedBase: preview.base,
    mint: ORBITX_MINT,
  };
}
