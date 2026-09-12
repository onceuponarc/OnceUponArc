import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("handle, display_name, bio, portrait_url, storage_portrait_path")
    .eq("handle", handle)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) return NextResponse.json({ error: "Unknown OnceUponer." }, { status: 404 });
  return NextResponse.json(data);
}
