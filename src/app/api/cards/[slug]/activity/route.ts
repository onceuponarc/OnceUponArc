import { NextResponse } from "next/server";
import { listActivity } from "@/lib/cards/store";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const activity = await listActivity(slug);
  return NextResponse.json({ activity });
}
