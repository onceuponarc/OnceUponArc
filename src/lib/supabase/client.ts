import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicEnv } from "@/lib/supabase/public-env";

export function createClient() {
  const { url, key } = supabasePublicEnv();
  return createBrowserClient(url, key);
}
