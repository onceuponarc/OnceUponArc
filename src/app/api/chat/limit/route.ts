import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getSpendCap, setSpendCap, todaysSpendUsd } from "@/lib/chat/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const { user } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  const [cap, spentToday] = await Promise.all([getSpendCap(user.id), todaysSpendUsd(user.id)]);
  return NextResponse.json({ ...cap, spentToday });
}

export async function POST(request: Request) {
  const { user } = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  const body = (await request.json()) as { dailyCapUsd?: number; enabled?: boolean };
  const dailyCapUsd = Math.max(0.05, Math.min(500, Number(body.dailyCapUsd ?? 5)));
  const enabled = body.enabled !== false;
  await setSpendCap(user.id, dailyCapUsd, enabled);
  return NextResponse.json({ dailyCapUsd, enabled });
}
