import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { originFromHeaders } from "@/lib/auth";

export async function GET(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(originFromHeaders(request.headers));
}
