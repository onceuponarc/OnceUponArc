import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const { user, profile } = await getSessionUser();
  if (!user || !profile) {
    return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  }
  return NextResponse.json({
    id: profile.id,
    handle: profile.handle,
    displayName: profile.displayName,
  });
}
