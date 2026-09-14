import { NextResponse } from "next/server";
import bs58 from "bs58";
import { getSessionUser } from "@/lib/auth";
import { generateVanityMint, VANITY_SUFFIX } from "@/lib/solana/vanity";
import { pumpCreateTx } from "@/lib/solana/pumpportal";
import { PUBLIC_SITE_URL } from "@onceupon/config/urls";
import { PAD_NAME } from "@onceupon/config/launchpad";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { profile } = await getSessionUser();
    if (!profile) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const body = (await request.json()) as {
      publicKey?: string;
      name?: string;
      symbol?: string;
      blurb?: string;
      metadataUri?: string;
      coverUrl?: string;
      devBuySol?: number;
      vanity?: boolean;
    };
    const publicKey = (body.publicKey ?? "").trim();
    const name = (body.name ?? "").trim();
    const symbol = (body.symbol ?? "").trim().toUpperCase().slice(0, 10);
    if (!publicKey) return NextResponse.json({ error: "Connect Phantom or use your OrbitX Solana desk." }, { status: 400 });
    if (!name || !symbol) return NextResponse.json({ error: "Name and ticker required." }, { status: 400 });

    const minted =
      body.vanity === false
        ? { keypair: (await import("@solana/web3.js")).Keypair.generate(), tries: 1, vanity: false }
        : generateVanityMint(VANITY_SUFFIX);
    const metadataUri =
      body.metadataUri ||
      `${PUBLIC_SITE_URL}/api/token/${minted.keypair.publicKey.toBase58()}/metadata`;

    const transaction = await pumpCreateTx({
      publicKey,
      name,
      symbol,
      metadataUri,
      mint: minted.keypair.publicKey.toBase58(),
      devBuySol: Number(body.devBuySol ?? 0),
    });

    return NextResponse.json({
      transaction,
      mint: minted.keypair.publicKey.toBase58(),
      mintSecret: bs58.encode(minted.keypair.secretKey),
      vanity: minted.vanity,
      suffix: VANITY_SUFFIX,
      tries: minted.tries,
      metadata: {
        name,
        symbol,
        description: body.blurb || `${name} launched on ${PAD_NAME}.`,
        image: body.coverUrl,
        createdOn: PUBLIC_SITE_URL,
        launchpad: PAD_NAME,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not build the Solana launch." },
      { status: 400 },
    );
  }
}
