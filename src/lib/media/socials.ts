function asUrl(raw: string): URL | null {
  const value = raw.trim();
  if (!value) return null;
  try {
    return new URL(value.includes("://") ? value : `https://${value}`);
  } catch {
    return null;
  }
}

function hostOk(url: URL, hosts: string[]) {
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  return hosts.some((item) => host === item || host.endsWith(`.${item}`));
}

export function cleanWebsite(raw: string): string | null {
  const url = asUrl(raw);
  if (!url) return null;
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  return url.toString();
}

export function cleanTwitter(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const handle = value.replace(/^@/, "");
  if (/^[A-Za-z0-9_]{1,15}$/.test(handle) && !value.includes(".")) {
    return `https://x.com/${handle}`;
  }
  const url = asUrl(value);
  if (!url) return null;
  if (!hostOk(url, ["x.com", "twitter.com"])) return null;
  return url.toString();
}

export function cleanTelegram(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const handle = value.replace(/^@/, "");
  if (/^[A-Za-z0-9_]{3,32}$/.test(handle) && !value.includes(".")) {
    return `https://t.me/${handle}`;
  }
  const url = asUrl(value);
  if (!url) return null;
  if (!hostOk(url, ["t.me", "telegram.me", "telegram.org"])) return null;
  return url.toString();
}
