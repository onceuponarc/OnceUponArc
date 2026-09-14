import { NextResponse } from "next/server";
import { fetchTweet } from "@/lib/cards/tweet";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json()) as { url?: string };
  if (!body.url) return NextResponse.json({ error: "Paste an X link." }, { status: 400 });
  const tweet = await fetchTweet(body.url);
  if (!tweet) return NextResponse.json({ error: "Could not read that post." }, { status: 404 });
  return NextResponse.json({ tweet });
}
