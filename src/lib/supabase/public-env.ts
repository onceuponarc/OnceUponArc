const DEFAULT_URL = "https://txrdfjypnuvlyseefclj.supabase.co";

function read(name: string): string {
  // Index access so Next does not bake `undefined` into the server bundle
  // when NEXT_PUBLIC_* was missing at build time.
  const raw = process.env[name];
  if (typeof raw !== "string") return "";
  const value = raw.trim();
  if (!value || value === "undefined" || value.includes("YOUR_ONCEUPON")) return "";
  return value;
}

export function supabasePublicUrl(): string {
  return (
    read("NEXT_PUBLIC_SUPABASE_URL") ||
    read("SUPABASE_URL") ||
    DEFAULT_URL
  );
}

export function supabaseAnonKey(): string {
  return (
    read("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    read("SUPABASE_ANON_KEY") ||
    read("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
    read("SUPABASE_PUBLISHABLE_KEY")
  );
}

export function supabasePublicEnv() {
  const url = supabasePublicUrl();
  const key = supabaseAnonKey();
  if (!url || !key) {
    throw new Error("Supabase public env is missing.");
  }
  return { url, key };
}
