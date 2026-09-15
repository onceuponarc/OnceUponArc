import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { TradePanel } from "@/components/token/trade-panel";
import { OFFICIAL_TOKEN } from "@/lib/official-token";

export const dynamic = "force-dynamic";

async function loadTradableTokens() {
  try {
    const db = createServiceClient();
    const { data } = await db
      .from("stories")
      .select("slug, title, ticker, token_address, cover_url")
      .eq("chain", "solana")
      .eq("status", "live")
      .not("token_address", "is", null)
      .order("created_at", { ascending: false })
      .limit(24);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function TradePage({
  searchParams,
}: {
  searchParams: Promise<{ mint?: string; symbol?: string }>;
}) {
  const { profile } = await getSessionUser();
  const params = await searchParams;
  const tokens = await loadTradableTokens();
  const activeMint = params.mint || OFFICIAL_TOKEN.mint;
  const activeSymbol = params.symbol || "ORBITX";

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">Trade</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Swap SOL or USDC for any Solana token</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Routed through Jupiter across every Solana DEX, signed by your in-app desk wallet — no separate wallet
          popup, no leaving OrbitX.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-2">
          <p className="text-xs text-white/40">Pick a token launched on OrbitX, or paste any mint below.</p>
          <div className="space-y-1.5">
            {tokens.map((t) => (
              <Link
                key={t.slug}
                href={`/trade?mint=${t.token_address}&symbol=${t.ticker}`}
                className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-sm hover:border-white/25"
              >
                <span className="font-medium">${t.ticker}</span>
                <span className="truncate text-xs text-white/40">{t.title}</span>
              </Link>
            ))}
          </div>
          <form action="/trade" className="mt-3 flex gap-2">
            <input
              name="mint"
              placeholder="Paste any Solana mint address"
              className="flex-1 rounded-xl border border-white/15 bg-transparent px-3 py-2 text-sm"
            />
            <button type="submit" className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-black">
              Load
            </button>
          </form>
        </div>

        <TradePanel tokenMint={activeMint} tokenSymbol={activeSymbol} signedIn={Boolean(profile)} />
      </div>
    </div>
  );
}
