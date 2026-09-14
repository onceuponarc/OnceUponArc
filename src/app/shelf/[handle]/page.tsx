import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { loadProfileDesk } from "@/lib/profile-desk";
import { ProfileDeskView } from "@/components/shelf/profile-desk";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return { title: `@${handle}` };
}

export default async function ShelfPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const { profile } = await getSessionUser();
  let desk = null;
  try {
    desk = await loadProfileDesk(handle, profile?.id ?? null);
  } catch (error) {
    console.error("Shelf load failed", error);
    return (
      <div className="mx-auto max-w-lg space-y-3 rounded-2xl border border-white/10 p-8">
        <h1 className="text-3xl font-bold">This profile could not load</h1>
        <p className="text-white/60">Supabase did not answer. Reload, then sign in with X if this is you.</p>
      </div>
    );
  }
  if (!desk) notFound();
  return <ProfileDeskView desk={desk} isSelf={profile?.id === desk.id} />;
}
