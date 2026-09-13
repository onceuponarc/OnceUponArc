import { createClient } from "@/lib/supabase/server";

export type OnceUponer = {
  id: string;
  handle: string;
  displayName: string;
  bio: string;
  portraitUrl: string | null;
  isStaff: boolean;
};

export async function getSessionUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { user: null, profile: null as OnceUponer | null };

    const { data: profile } = await supabase
      .from("users")
      .select("id, handle, display_name, bio, portrait_url, storage_portrait_path, is_staff")
      .eq("id", user.id)
      .maybeSingle();

    return {
      user,
      profile: profile
        ? {
            id: profile.id as string,
            handle: profile.handle as string,
            displayName: profile.display_name as string,
            bio: profile.bio as string,
            portraitUrl: (profile.portrait_url as string | null) ?? null,
            isStaff: Boolean(profile.is_staff),
          }
        : null,
    };
  } catch (error) {
    console.error("getSessionUser failed", error);
    return { user: null, profile: null as OnceUponer | null };
  }
}

export function originFromHeaders(headers: Headers) {
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  const proto = headers.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://127.0.0.1:43147";
}
