export type SpawnedTweet = {
  tweetId: string;
  tweetUrl: string;
  handle: string;
  name: string;
  text: string;
  coverUrl: string | null;
};

export function parseTweetId(raw: string): { id: string; handle: string | null } | null {
  const text = raw.trim();
  const url = text.match(/(?:x\.com|twitter\.com)\/([^/]+)\/status\/(\d+)/i);
  if (url) return { handle: url[1] === "i" ? null : url[1], id: url[2] };
  if (/^\d{8,}$/.test(text)) return { handle: null, id: text };
  return null;
}

export async function fetchTweet(raw: string): Promise<SpawnedTweet | null> {
  const parsed = parseTweetId(raw);
  if (!parsed) return null;
  const path = parsed.handle
    ? `${encodeURIComponent(parsed.handle)}/status/${parsed.id}`
    : `status/${parsed.id}`;
  const res = await fetch(`https://api.fxtwitter.com/${path}`, {
    headers: { accept: "application/json", "user-agent": "OnceUponArc/1.0" },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    tweet?: {
      id?: string;
      url?: string;
      text?: string;
      author?: { screen_name?: string; name?: string; avatar_url?: string };
      media?: { photos?: { url?: string }[]; videos?: { thumbnail_url?: string }[] };
    };
  };
  const tweet = json.tweet;
  if (!tweet?.id) return null;
  const photo = tweet.media?.photos?.[0]?.url ?? tweet.media?.videos?.[0]?.thumbnail_url ?? null;
  const handle = tweet.author?.screen_name ?? parsed.handle ?? "onceupon";
  return {
    tweetId: String(tweet.id),
    tweetUrl: tweet.url ?? `https://x.com/${handle}/status/${tweet.id}`,
    handle,
    name: tweet.author?.name ?? handle,
    text: tweet.text ?? "",
    coverUrl: photo ?? tweet.author?.avatar_url ?? null,
  };
}
