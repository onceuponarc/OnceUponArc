/** X serves `_normal` (48px). Prefer original / 400px for banners and avatars. */
export function hiResPortrait(url: string | null | undefined): string | null {
  if (!url) return null;
  return url
    .replace(/_normal(\.\w+)(?:\?.*)?$/, "_400x400$1")
    .replace(/_bigger(\.\w+)(?:\?.*)?$/, "_400x400$1")
    .replace(/_mini(\.\w+)(?:\?.*)?$/, "_400x400$1")
    .replace(/_200x200(\.\w+)(?:\?.*)?$/, "_400x400$1");
}

export function bannerFromCover(url: string | null | undefined): string | null {
  if (!url) return null;
  return hiResPortrait(url) ?? url;
}
