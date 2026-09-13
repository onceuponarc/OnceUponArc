import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { launchOnArc } from "@/lib/arc/chapter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { profile } = await getSessionUser();
    const body = (await request.json()) as {
      title?: string;
      ticker?: string;
      blurb?: string;
      engine?: "author" | "onceuponers";
      authorBps?: number;
      graduateUi?: number;
      coverUrl?: string | null;
      rightsAttested?: boolean;
    };
    if (!body.title || !body.ticker) {
      return NextResponse.json({ error: "Name and ticker are required." }, { status: 400 });
    }
    if (!body.rightsAttested) {
      return NextResponse.json({ error: "Attest you have the rights to the art and name." }, { status: 400 });
    }
    const result = await launchOnArc({
      title: body.title,
      ticker: body.ticker,
      blurb: body.blurb ?? "",
      engine: body.engine === "onceuponers" ? "onceuponers" : "author",
      authorBps: Number(body.authorBps ?? 100),
      graduateUi: Number(body.graduateUi ?? 5000),
      handle: profile?.handle ?? "devnet",
      coverUrl: body.coverUrl ?? null,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Arc launch failed." },
      { status: 400 },
    );
  }
}
