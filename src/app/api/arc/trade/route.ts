import { NextResponse } from "next/server";
import { quoteArcTrade, tradeOnArc } from "@/lib/arc/chapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      slug?: string;
      side?: "buy" | "sell";
      amount?: number;
      quote?: boolean;
    };
    if (!body.slug || (body.side !== "buy" && body.side !== "sell")) {
      return NextResponse.json({ error: "Need a slug and a buy or sell." }, { status: 400 });
    }
    const amount = Number(body.amount ?? 0);
    if (!(amount > 0)) return NextResponse.json({ error: "Amount must be greater than zero." }, { status: 400 });
    if (body.quote) {
      const quoted = await quoteArcTrade(body.slug, body.side, amount);
      return NextResponse.json(quoted);
    }
    const result = await tradeOnArc(body.slug, body.side, amount);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Arc trade failed." },
      { status: 400 },
    );
  }
}
