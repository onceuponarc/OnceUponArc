import { ArcDevnetWallet } from "@/components/arc/devnet-wallet";
import { SignOutButton } from "@/components/sign-in-button";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { XMark } from "@/components/x-mark";
import Link from "next/link";

export const metadata = { title: "You" };

export default async function YouPage() {
  const { profile } = await getSessionUser();
  let stories: { slug: string; title: string; ticker: string; status: string }[] = [];
  try {
    if (profile) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("stories")
        .select("slug, title, ticker, status")
        .eq("author_user_id", profile.id)
        .eq("chain", "arc")
        .order("created_at", { ascending: false })
        .limit(24);
      stories = data ?? [];
    }
  } catch (error) {
    console.error("You page stories failed", error);
  }

  const live = stories.filter((item) => item.status === "live").length;
  const graduated = stories.filter((item) => item.status === "graduated").length;

  return (
    <div className="mx-auto max-w-2xl space-y-0 overflow-hidden rounded-2xl border border-white/10">
      <div className="relative h-36 bg-white/10">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgb(0_0_0_/_80%))]" />
      </div>
      <div className="-mt-12 px-5 pb-6">
        <div className="flex items-end justify-between">
          <Avatar className="size-24 border-4 border-black">
            {profile?.portraitUrl ? <AvatarImage src={profile.portraitUrl} alt="" /> : null}
            <AvatarFallback>{(profile?.handle ?? "Y").slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          {profile ? (
            <div className="mb-1 flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/shelf/${profile.handle}`}>Public</Link>
              </Button>
              <SignOutButton />
            </div>
          ) : (
            <Button asChild className="mb-1">
              <a href="/auth/login">
                <XMark className="size-3.5" />
                Sign in with X
              </a>
            </Button>
          )}
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          {profile ? profile.displayName || profile.handle : "Your profile"}
        </h1>
        <p className="text-white/45">@{profile?.handle ?? "unsigned"}</p>
        <p className="mt-3 text-sm text-white/70">
          {profile?.bio || "X is identity. Launch on Arc. Bind a wallet on the wallet desk."}
        </p>
        <div className="mt-4 flex gap-5 text-sm">
          <p>
            <span className="font-semibold">{stories.length}</span> <span className="text-white/45">Launches</span>
          </p>
          <p>
            <span className="font-semibold">{live}</span> <span className="text-white/45">Live</span>
          </p>
          <p>
            <span className="font-semibold">{graduated}</span> <span className="text-white/45">Graduated</span>
          </p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button asChild variant="outline">
            <Link href="/wallet">Wallet</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/launch/arc">Launch</Link>
          </Button>
        </div>
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/40">Launches</p>
          {!stories.length ? (
            <p className="mt-3 text-sm text-white/50">No tokens yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-white/10">
              {stories.map((story) => (
                <li key={story.slug} className="py-3">
                  <Link href={`/story/${story.slug}`} className="flex items-center justify-between">
                    <span className="font-semibold">${story.ticker}</span>
                    <span className="text-sm text-white/45">{story.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-6">
          <ArcDevnetWallet />
        </div>
      </div>
    </div>
  );
}
