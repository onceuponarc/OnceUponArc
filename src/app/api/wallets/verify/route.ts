import { NextResponse } from "next/server";
import nacl from "tweetnacl";
import { PublicKey } from "@solana/web3.js";
import { getSessionUser } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/service";
import { SOLANA } from "@onceupon/config/solana";
import { redactWalletError } from "@/lib/crypto/secret-box";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bytesFromBase64(value: string) {
  return Uint8Array.from(Buffer.from(value, "base64"));
}

export async function POST(request: Request) {
  const { user } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });

  const body = (await request.json()) as {
    address?: string;
    issuedAt?: string;
    signature?: string;
  };

  if (!body.address || !body.issuedAt || !body.signature) {
    return NextResponse.json({ error: "Wallet proof is incomplete." }, { status: 400 });
  }

  const issued = Date.parse(body.issuedAt);
  if (!Number.isFinite(issued) || Math.abs(Date.now() - issued) > 10 * 60 * 1000) {
    return NextResponse.json({ error: "Wallet proof expired. Connect again." }, { status: 400 });
  }

  try {
    const pubkey = new PublicKey(body.address);
    const message = new TextEncoder().encode(`OnceUpon:${user.id}:${body.issuedAt}`);
    const signature = bytesFromBase64(body.signature);
    const ok = nacl.sign.detached.verify(message, signature, pubkey.toBytes());
    if (!ok) {
      return NextResponse.json({ error: "Wallet signature did not verify." }, { status: 400 });
    }

    const service = createServiceClient();
    await service
      .from("user_wallets")
      .update({ is_primary: false })
      .eq("user_id", user.id);

    const { error } = await service.from("user_wallets").upsert(
      {
        user_id: user.id,
        chain_caip2: SOLANA.caip2,
        address: pubkey.toBase58(),
        is_primary: true,
        kind: "connected",
        verified_at: new Date().toISOString(),
      },
      { onConflict: "chain_caip2,address" },
    );
    if (error) throw new Error(error.message);

    return NextResponse.json({ address: pubkey.toBase58(), bound: true });
  } catch (error) {
    return NextResponse.json({ error: redactWalletError(error) }, { status: 400 });
  }
}
