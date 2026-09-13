import { NextResponse } from "next/server";
import { VersionedTransaction } from "@solana/web3.js";
import { solanaConnection } from "@/lib/solana/connection";
import { explorerTx } from "@/lib/solana/connection";

export async function POST(request: Request) {
  const body = (await request.json()) as { signedTx?: string };
  if (!body.signedTx) {
    return NextResponse.json({ error: "signedTx is required." }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(body.signedTx, "base64");
    const tx = VersionedTransaction.deserialize(bytes);
    const connection = solanaConnection();
    const signature = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    });
    return NextResponse.json({ signature, explorer: explorerTx(signature) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not land the transaction." },
      { status: 400 },
    );
  }
}
