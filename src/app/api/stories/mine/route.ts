import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { getPumpBondingProgress } from "@/lib/solana/pump-progress";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user } = await getSessionUser();
  if (!user) return NextResponse.json({ tokens: [] });
  const db = createServiceClient();
  const { data } = await db
    .from("stories")
    .select("slug, title, ticker, chain, status, token_address, cover_url, curve_quote_lamports, quote_decimals, graduation_quote_raw")
    .eq("author_user_id", user.id)
    .in("status", ["live", "graduated"])
    .order("created_at", { ascending: false })
    .limit(50);

  const rows = data ?? [];
  const tokens = await Promise.all(
    rows.map(async (row) => {
      let progressBps = 0;
      let graduated = row.status === "graduated";
      if (row.chain === "solana" && row.token_address) {
        const bonding = await getPumpBondingProgress(row.token_address).catch(() => null);
        if (bonding) {
          progressBps = bonding.progressBps;
          graduated = bonding.graduated || graduated;
        }
      } else if (!graduated) {
        const qDec = Number(row.quote_decimals ?? 6);
        const raised = Number(row.curve_quote_lamports ?? 0) / 10 ** qDec;
        const target = Number(row.graduation_quote_raw ?? 0) / 10 ** qDec;
        progressBps = target > 0 ? Math.round(Math.min(1, raised / target) * 10_000) : 0;
      }
      return {
        slug: row.slug,
        title: row.title,
        ticker: row.ticker,
        chain: row.chain,
        coverUrl: row.cover_url,
        progressBps,
        graduated,
      };
    }),
  );

  return NextResponse.json({ tokens });
}
