import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { originFromHeaders } from "@/lib/auth";
import { hiResPortrait } from "@/lib/media";

async function copyPortrait(userId: string, sourceUrl: string | null) {
  if (!sourceUrl) return null;
  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const service = createServiceClient();
    const path = `${userId}/portrait.png`;
    const { error } = await service.storage.from("portraits").upload(path, buf, {
      contentType: res.headers.get("content-type") ?? "image/png",
      upsert: true,
    });
    if (error) return null;
    const { data } = service.storage.from("portraits").getPublicUrl(path);
    await service
      .from("users")
      .update({ storage_portrait_path: path, portrait_url: data.publicUrl })
      .eq("id", userId);
    return data.publicUrl;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const origin = originFromHeaders(request.headers);
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?message=Missing+OAuth+code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent(error.message)}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const meta = user.user_metadata ?? {};
    const raw = (meta.avatar_url as string | undefined) ?? (meta.picture as string | undefined) ?? null;
    const avatar = hiResPortrait(raw) ?? raw;
    await copyPortrait(user.id, avatar);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
