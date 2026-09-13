import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { confirmLaunch } from "@/lib/solana/launch";
import { redactWalletError } from "@/lib/crypto/secret-box";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { user, profile } = await getSessionUser();
    if (!user || !profile) {
      return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    }

    let body: { confirm?: boolean; slug?: string; signature?: string };
    try {
      body = (await request.json()) as { confirm?: boolean; slug?: string; signature?: string };
    } catch {
      return NextResponse.json({ error: "Launch request was empty. Retry." }, { status: 400 });
    }

    if (body.confirm) {
      if (!body.slug || !body.signature) {
        return NextResponse.json({ error: "Launch confirmation needs a slug and signature." }, { status: 400 });
      }
      const result = await confirmLaunch(user.id, body.slug, body.signature);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "OnceUpon prints on Arc only. Open the Arc press." }, { status: 410 });
  } catch (error) {
    console.error("launch route failed", error);
    return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
  }
}
