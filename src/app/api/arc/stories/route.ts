import { NextResponse } from "next/server";
import { allArcStories, arcSnapshot } from "@/lib/arc/chapter";
import { localTape } from "@/lib/arc/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (slug) {
    try {
      const snap = await arcSnapshot(slug);
      if (!snap) return NextResponse.json({ error: "Unknown Chapter." }, { status: 404 });
      return NextResponse.json(snap);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Could not read the curve." },
        { status: 400 },
      );
    }
  }
  return NextResponse.json({
    stories: await allArcStories(),
    tape: localTape(30),
  });
}
