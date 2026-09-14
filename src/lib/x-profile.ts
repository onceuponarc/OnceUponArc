export type XPublicProfile = {
  handle: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  xUserId: string | null;
};

function upgradeAvatar(url: string | null | undefined) {
  if (!url) return null;
  return url
    .replace("_normal.", "_400x400.")
    .replace("_bigger.", "_400x400.")
    .replace("_mini.", "_400x400.");
}

function upgradeBanner(url: string | null | undefined) {
  if (!url) return null;
  if (/\/\d+x\d+$/.test(url)) return url;
  return `${url.replace(/\/$/, "")}/1500x500`;
}

export async function fetchXProfile(handle: string): Promise<XPublicProfile | null> {
  const clean = handle.replace(/^@/, "").trim();
  if (!clean) return null;
  try {
    const res = await fetch(`https://api.fxtwitter.com/${encodeURIComponent(clean)}`, {
      headers: { accept: "application/json", "user-agent": "OnceUponArc/1.0" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      user?: {
        id?: string;
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
      bannerUrl: upgradeBanner(user.banner_url),
      xUserId: user.id ?? null,
    };
  } catch {
    return {
      handle: clean,
      name: clean,
      bio: "",
      avatarUrl: `https://unavatar.io/twitter/${encodeURIComponent(clean)}`,
      bannerUrl: null,
      xUserId: null,
    };
  }
}
