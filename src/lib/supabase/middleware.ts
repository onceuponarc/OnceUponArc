import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabasePublicUrl } from "@/lib/supabase/public-env";

export async function updateSession(request: NextRequest) {
  const url = supabasePublicUrl();
  const key = supabaseAnonKey();
  let response = NextResponse.next({ request });

  if (!url || !key) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  try {
    await supabase.auth.getUser();
  } catch (error) {
    console.error("session refresh failed", error);
  }
  return response;
}
