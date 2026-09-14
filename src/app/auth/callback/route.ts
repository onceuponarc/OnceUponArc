import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { originFromHeaders } from "@/lib/auth";
import { hiResPortrait } from "@/lib/media";
import { fetchXProfile } from "@/lib/x-profile";

async function storeImage(userId: string, filename: string, sourceUrl: string | null) {
  if (!sourceUrl) return null;
  try {
    const res = await fetch(sourceUrl);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const service = createServiceClient();
    const path = `${userId}/${filename}`;
    const { error } = await service.storage.from("portraits").upload(path, buf, {
      contentType: res.headers.get("content-type") ?? "image/jpeg",
      upsert: true,
    });
    if (error) return sourceUrl;
    const { data } = service.storage.from("portraits").getPublicUrl(path);
    return data.publicUrl ?? sourceUrl;
  } catch {
    return sourceUrl;
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
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const meta = user.user_metadata ?? {};
    const handle = String(
      meta.user_name ?? meta.preferred_username ?? meta.screen_name ?? "",
    ).replace(/^@/, "");
    const x = handle ? await fetchXProfile(handle) : null;
    const rawAvatar =
      x?.avatarUrl ?? (meta.avatar_url as string | undefined) ?? (meta.picture as string | undefined) ?? null;
    const avatar = hiResPortrait(rawAvatar) ?? rawAvatar;
    const storedPortrait = await storeImage(user.id, "portrait.jpg", avatar);
    const storedBanner = await storeImage(user.id, "banner.jpg", x?.bannerUrl ?? null);

    const patch: Record<string, string | null> = {
      display_name: x?.name || (meta.full_name as string) || (meta.name as string) || handle,
      bio: x?.bio ?? (meta.bio as string) ?? (meta.description as string) ?? "",
      portrait_url: storedPortrait ?? avatar,
      storage_portrait_path: storedPortrait ? `${user.id}/portrait.jpg` : null,
      banner_url: storedBanner ?? x?.bannerUrl ?? null,
    };

    try {
      const service = createServiceClient();
      const first = await service.from("users").update(patch).eq("id", user.id);
      if (first.error) {
        delete patch.banner_url;
        await service.from("users").update(patch).eq("id", user.id);
      }
    } catch (syncError) {
      console.error("X profile sync failed", syncError);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
