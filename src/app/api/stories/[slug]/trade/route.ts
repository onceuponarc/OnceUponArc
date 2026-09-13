import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { buyOnCurve, claimPiece, confirmCurveTrade, fundHolderRewards, sellOnCurve } from "@/lib/solana/trade";
import { redactWalletError } from "@/lib/crypto/secret-box";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { user } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  const { slug } = await context.params;
  const body = (await request.json()) as {
    action?: "buy" | "sell" | "claim" | "fund" | "confirm";
    amount?: number;
    payer?: string;
    signature?: string;
    side?: "buy" | "sell" | "claim" | "fund";
  };

  try {
    if (body.action === "confirm") {
      if (!body.signature || !body.side) {
        return NextResponse.json({ error: "Confirmation needs a signature and side." }, { status: 400 });
      }
      const supabase = await createClient();
      const { data } = await supabase.from("stories").select("mint_decimals").eq("slug", slug).maybeSingle();
      const decimals = Number(data?.mint_decimals ?? 6);
      const result = await confirmCurveTrade(
        user.id,
        slug,
        body.signature,
        body.side,
        Number(body.amount ?? 0),
        decimals,
        body.payer,
      );
      return NextResponse.json(result);
    }
    if (body.action === "buy") {
      const result = await buyOnCurve(user.id, slug, Number(body.amount ?? 0), body.payer);
      return NextResponse.json(result);
    }
    if (body.action === "sell") {
      const supabase = await createClient();
      const { data } = await supabase.from("stories").select("mint_decimals").eq("slug", slug).maybeSingle();
      const decimals = Number(data?.mint_decimals ?? 6);
      const result = await sellOnCurve(user.id, slug, Number(body.amount ?? 0), decimals, body.payer);
      return NextResponse.json(result);
    }
    if (body.action === "claim") {
      const result = await claimPiece(user.id, slug, body.payer);
      return NextResponse.json(result);
    }
    if (body.action === "fund") {
      const result = await fundHolderRewards(user.id, slug, Number(body.amount ?? 0), body.payer);
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
  }
}
