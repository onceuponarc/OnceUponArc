export type XPublicProfile = {
  handle: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
};

function upgradeAvatar(url: string | null | undefined) {
  if (!url) return null;
  return url
    .replace("_normal.", ".")
    .replace("_bigger.", ".")
    .replace("_mini.", ".")
    .replace("_200x200.", ".")
    .replace("_400x400.", ".");
}

export async function fetchXProfile(handle: string): Promise<XPublicProfile | null> {
  const clean = handle.replace(/^@/, "").trim();
  if (!clean) return null;
  try {
    const res = await fetch(`https://api.fxtwitter.com/${encodeURIComponent(clean)}`, {
      headers: { accept: "application/json" },
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      user?: {
        screen_name?: string;
        name?: string;
        description?: string;
        avatar_url?: string;
        banner_url?: string;
      };
    };
    const user = json.user;
    if (!user) return null;
    return {
      handle: user.screen_name || clean,
      name: user.name || clean,
      bio: user.description || "",
      avatarUrl: upgradeAvatar(user.avatar_url) ?? user.avatar_url ?? null,
      bannerUrl: user.banner_url || null,
    };
  } catch {
    return null;
  }
}
