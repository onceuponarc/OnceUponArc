import { NextResponse } from "next/server";
import { fetchXProfile } from "@/lib/x-profile";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const handle = new URL(request.url).searchParams.get("handle") ?? "";
  const profile = await fetchXProfile(handle);
  if (!profile) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(profile);
}
