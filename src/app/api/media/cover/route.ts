import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { coverFromPaste, storeCover } from "@/lib/media/cover";
import { redactWalletError } from "@/lib/crypto/secret-box";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { user } = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });

    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { url?: string };
      const pasted = coverFromPaste(body.url ?? "");
      if (!pasted) {
        return NextResponse.json(
          { error: "Paste an IPFS CID, ipfs:// URI, or https image URL." },
          { status: 400 },
        );
      }
      return NextResponse.json(pasted);
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    }
    const stored = await storeCover(user.id, file);
    return NextResponse.json(stored);
  } catch (error) {
    return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
  }
}
