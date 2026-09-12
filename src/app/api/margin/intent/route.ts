import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { user } = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  }

  const body = (await request.json()) as {
    market?: string;
    side?: "long" | "short";
    sizeUsd?: number;
    leverage?: number;
  };

  if (!body.market || (body.side !== "long" && body.side !== "short")) {
    return NextResponse.json({ error: "Market and side are required." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("margin_intents")
    .insert({
      user_id: user.id,
      venue: "jupiter",
      market: body.market,
      side: body.side,
      leverage: body.leverage ?? 1,
      size_usd: body.sizeUsd ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
