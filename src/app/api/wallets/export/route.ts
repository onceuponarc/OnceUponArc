import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "In-app wallets are gone. Connect Phantom, Solflare, or Backpack. That address is bound to your X login." },
    { status: 410 },
  );
}
