import { NextResponse } from "next/server";
import { VersionedTransaction } from "@solana/web3.js";
import { getSessionUser } from "@/lib/auth";
import { generateVanityMint, VANITY_SUFFIX } from "@/lib/solana/vanity";
import { pumpCreateTx } from "@/lib/solana/pumpportal";
import { sendSignedTx, waitForTx, explorerFromSig } from "@/lib/solana/partial-tx";
import { deskSolanaKey } from "@/lib/wallets/sign-desk";
import { PUBLIC_SITE_URL } from "@onceupon/config/urls";
import { PAD_NAME } from "@onceupon/config/launchpad";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { user, profile } = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
    const body = (await request.json()) as {
      name?: string;
      symbol?: string;
      blurb?: string;
      metadataUri?: string;
      coverUrl?: string;
      devBuySol?: number;
      vanity?: boolean;
    };
    const name = (body.name ?? "").trim();
    const symbol = (body.symbol ?? "").trim().toUpperCase().slice(0, 10);
    if (!name || !symbol) return NextResponse.json({ error: "Name and ticker required." }, { status: 400 });

    const payer = await deskSolanaKey(user.id);
    const minted =
      body.vanity === false
        ? { keypair: (await import("@solana/web3.js")).Keypair.generate(), tries: 1, vanity: false }
        : generateVanityMint(VANITY_SUFFIX);
    const metadataUri =
      body.metadataUri || `${PUBLIC_SITE_URL}/api/token/${minted.keypair.publicKey.toBase58()}/metadata`;

    const built = await pumpCreateTx({
      publicKey: payer.publicKey.toBase58(),
      name,
      symbol,
      metadataUri,
      mint: minted.keypair.publicKey.toBase58(),
      devBuySol: Number(body.devBuySol ?? 0),
    });

    const tx = VersionedTransaction.deserialize(Buffer.from(built, "base64"));
    tx.sign([minted.keypair, payer]);
    const signature = await sendSignedTx(Buffer.from(tx.serialize()).toString("base64"));
    await waitForTx(signature).catch(() => undefined);

    return NextResponse.json({
      mint: minted.keypair.publicKey.toBase58(),
      signature,
      explorer: explorerFromSig(signature),
      creator: payer.publicKey.toBase58(),
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
        creatorX: profile?.handle ? `@${profile.handle}` : "",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not launch on Solana." },
      { status: 400 },
    );
  }
}
