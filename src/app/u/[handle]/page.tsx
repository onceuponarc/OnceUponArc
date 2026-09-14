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
  return {
    title: `@${handle}`,
    description: `Public OnceUpon desk for @${handle}.`,
    openGraph: {
      title: `@${handle} · OnceUpon`,
      description: "Public Arc desk. Chapters, tape, and fees.",
      url: `/u/${handle}`,
    },
  };
}

export default async function PublicProfilePage({
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
    console.error("Public profile failed", error);
    return (
      <div className="rounded-3xl border border-white/10 p-8">
        <h1 className="text-3xl font-bold">This profile could not load</h1>
        <p className="mt-2 text-white/60">Reload, then try the public link again.</p>
      </div>
    );
  }
  if (!desk) notFound();
  return <ProfileDeskView desk={desk} isSelf={false} />;
}
