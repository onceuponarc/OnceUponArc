/** Only allow browser-loadable image URLs. Storage paths like "uuid/portrait.jpg" are not. */
export function publicMediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const value = url.trim();
  if (!value) return null;
  if (value.startsWith("/")) return value;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return null;
}

/** X serves `_normal` (48px). Prefer original / 400px for banners and avatars. */
export function hiResPortrait(url: string | null | undefined): string | null {
  const value = publicMediaUrl(url);
  if (!value) return null;
  return value
    .replace(/_normal(\.\w+)(?:\?.*)?$/, "_400x400$1")
    .replace(/_bigger(\.\w+)(?:\?.*)?$/, "_400x400$1")
    .replace(/_mini(\.\w+)(?:\?.*)?$/, "_400x400$1")
    .replace(/_200x200(\.\w+)(?:\?.*)?$/, "_400x400$1");
}

export function bannerFromCover(url: string | null | undefined): string | null {
  if (!url) return null;
  return hiResPortrait(url) ?? publicMediaUrl(url);
}

export function xAvatarFallback(handle: string | null | undefined): string | null {
  const clean = String(handle ?? "")
    .replace(/^@/, "")
    .trim();
  if (!clean) return null;
  return `https://unavatar.io/twitter/${encodeURIComponent(clean)}?fallback=false`;
}
