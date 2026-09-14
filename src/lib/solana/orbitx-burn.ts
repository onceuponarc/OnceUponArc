import "server-only";

import BN from "bn.js";
import { Keypair, PublicKey } from "@solana/web3.js";
import { MintLayout } from "@solana/spl-token";
import { OnlinePumpAmmSdk, buyQuoteInput } from "@pump-fun/pump-swap-sdk";
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
 * Builds the single on-chain instruction that buys $ORBITX with `lamports` of
 * SOL and burns everything it receives — PumpSwap's own boost-buy-and-burn
 * primitive, not a hand-assembled buy+burn pair. `minBaseAmountBurned` is
 * derived from the pool's live reserves with an 8% slippage floor so this
 * still reverts cleanly (spending nothing) if the price moved hard between
 * quoting and sending, rather than silently burning less than expected.
 */
export async function buildOrbitxBurnIx(payer: Keypair, lamports: number) {
  const sdk = amm();
  const pool = await sdk.fetchPool(ORBITX_POOL);
  const globalConfig = await sdk.fetchGlobalConfigAccount();
  const feeConfig = await sdk.fetchFeeConfigAccount().catch(() => null);
  const [baseAccount, quoteAccount, baseMintInfo] = await Promise.all([
    solanaConnection().getTokenAccountBalance(pool.poolBaseTokenAccount),
    solanaConnection().getTokenAccountBalance(pool.poolQuoteTokenAccount),
    solanaConnection().getAccountInfo(pool.baseMint),
  ]);
  if (!baseMintInfo) throw new Error("Could not read the $ORBITX mint account.");
  const baseMintAccount = MintLayout.decode(baseMintInfo.data);

  const quote = new BN(lamports);
  const preview = buyQuoteInput({
    quote,
    slippage: SLIPPAGE_PCT,
    baseReserve: new BN(baseAccount.value.amount),
    quoteReserve: new BN(quoteAccount.value.amount),
    virtualQuoteReserves: pool.virtualQuoteReserves,
    globalConfig,
    baseMintAccount,
    baseMint: pool.baseMint,
    coinCreator: pool.coinCreator,
    creator: pool.creator,
    feeConfig,
    isMayhemMode: pool.isMayhemMode,
    creatorFeeBps: pool.creatorFeeBps,
  });

  const minBaseAmountBurned = preview.base.muln(100 - SLIPPAGE_PCT).divn(100);
  const ix = await sdk.boostBuyAndBurnInstruction(ORBITX_POOL, payer.publicKey, quote, minBaseAmountBurned);
  return { instruction: ix, expectedBase: preview.base, mint: ORBITX_MINT };
}
