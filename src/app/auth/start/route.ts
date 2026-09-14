import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { originFromHeaders } from "@/lib/auth";

export async function GET(request: Request) {
  const origin = originFromHeaders(request.headers);
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "x",
      options: {
        redirectTo: `${origin}/auth/callback`,
        scopes: "tweet.read users.read follows.read follows.write offline.access",
      },
    });

    if (error || !data.url) {
      const dest = new URL("/auth/error", origin);
      dest.searchParams.set("message", error?.message ?? "X sign-in could not start.");
      return NextResponse.redirect(dest);
    }

    return NextResponse.redirect(data.url);
  } catch (error) {
    const dest = new URL("/auth/error", origin);
    dest.searchParams.set(
      "message",
      error instanceof Error ? error.message : "X sign-in could not start.",
    );
    return NextResponse.redirect(dest);
  }
}
