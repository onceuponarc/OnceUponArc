import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { exportUserSecret } from "@/lib/wallets/embedded";
import { redactWalletError } from "@/lib/crypto/secret-box";

export async function POST(request: Request) {
  const { user } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { confirm?: boolean };
  if (!body.confirm) {
    return NextResponse.json({ error: "Export requires an explicit confirm." }, { status: 400 });
  }
  try {
    const payload = await exportUserSecret(user.id);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store, no-cache, private",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
  }
}
