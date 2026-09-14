import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchXProfile } from "@/lib/x-profile";

export const dynamic = "force-dynamic";

function intentUrl(handle: string) {
  return `https://x.com/intent/follow?screen_name=${encodeURIComponent(handle)}`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { handle?: string } | null;
  const handle = String(body?.handle ?? "")
    .replace(/^@/, "")
    .trim();
  if (!handle) return NextResponse.json({ error: "Missing handle" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.provider_token;
  const meta = session?.user?.user_metadata ?? {};
  const sourceId = String(meta.provider_id ?? meta.sub ?? meta.user_id ?? "");
  const target = await fetchXProfile(handle);
  const targetId = target?.xUserId;

  if (token && sourceId && targetId) {
    try {
      const res = await fetch(`https://api.x.com/2/users/${sourceId}/following`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ target_user_id: targetId }),
      });
      if (res.ok) {
        return NextResponse.json({ ok: true, via: "api", handle });
      }
      const text = await res.text();
      console.error("X follow API", res.status, text);
    } catch (error) {
      console.error("X follow API failed", error);
    }
  }

  return NextResponse.json({
    ok: true,
    via: "intent",
    handle,
    intent: intentUrl(handle),
  });
}
