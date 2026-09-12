import { NextResponse } from "next/server";
import { verifyMessage, isAddress, getAddress } from "viem";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ARC_TESTNET } from "@onceupon/config/arc";

export async function POST(request: Request) {
  const { user, profile } = await getSessionUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  }

  const body = (await request.json()) as {
    address?: string;
    issuedAt?: string;
    signature?: string;
    chainCaip2?: string;
  };

  if (!body.address || !body.issuedAt || !body.signature || !isAddress(body.address)) {
    return NextResponse.json({ error: "Malformed wallet proof." }, { status: 400 });
  }

  const issued = Date.parse(body.issuedAt);
  if (!Number.isFinite(issued) || Math.abs(Date.now() - issued) > 10 * 60 * 1000) {
    return NextResponse.json({ error: "Signature timestamp is stale." }, { status: 400 });
  }

  const expected = `OnceUpon:${profile.id}:${body.issuedAt}`;
  const ok = await verifyMessage({
    address: getAddress(body.address),
    message: expected,
    signature: body.signature as `0x${string}`,
  });
  if (!ok) {
    return NextResponse.json({ error: "Signature does not match OnceUpon:{user}:{time}." }, { status: 400 });
  }

  const address = getAddress(body.address);
  const chain = body.chainCaip2 ?? ARC_TESTNET.caip2;
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("user_wallets")
    .select("user_id")
    .eq("chain_caip2", chain)
    .eq("address", address)
    .maybeSingle();

  if (existing && existing.user_id !== user.id) {
    return NextResponse.json({ error: "This wallet is already bound to another OnceUponer." }, { status: 409 });
  }

  await supabase.from("user_wallets").update({ is_primary: false }).eq("user_id", user.id);

  const { error } = await supabase.from("user_wallets").upsert(
    {
      user_id: user.id,
      chain_caip2: chain,
      address,
      is_primary: true,
      verified_at: new Date().toISOString(),
      verify_sig: body.signature,
    },
    { onConflict: "chain_caip2,address" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ address, chain });
}
