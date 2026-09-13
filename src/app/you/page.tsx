import { ConnectedWalletCard } from "@/components/wallet/connected-wallet";
import { SignOutButton } from "@/components/sign-in-button";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
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
        .order("created_at", { ascending: false })
        .limit(12);
      stories = data ?? [];
    }
  } catch (error) {
    console.error("You page stories failed", error);
  }

  return (
    <div className="space-y-6">
      <section className="glass rounded-[28px] border border-arc/25 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">You</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold">
          {profile ? `@${profile.handle}` : "Your pad"}
        </h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          X is identity. A connected Solana wallet signs launches and swaps. Bindings, margin, and the crew
          live here.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {profile ? (
            <>
              <Button asChild className="rounded-full">
                <Link href={`/shelf/${profile.handle}`}>Public shelf</Link>
              </Button>
              <SignOutButton />
            </>
          ) : (
            <Button asChild className="rounded-full">
              <a href="/auth/login">
                <XMark className="size-3.5" />
                Sign in with X
              </a>
            </Button>
          )}
        </div>
      </section>

      <ConnectedWalletCard signedIn={Boolean(profile)} />

      <section className="grid gap-3 sm:grid-cols-2">
        {[
          { href: "/bindings", label: "Link LP", body: "Bind NVDAx/USDC or paste a pool you opened for your mint after launch." },
          { href: "/margin", label: "Margin", body: "Doorway to Jupiter perps. OnceUpon does not custody leverage." },
          { href: "/onceuponers", label: "Crew", body: "Handles on the pad — not a PnL board." },
          { href: "/chapter/the-first-chapter", label: "First Chapter", body: "The first official launch window." },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="glass rounded-2xl border border-white/10 p-4 hover:border-arc/40">
            <p className="font-heading text-lg font-bold">{item.label}</p>
            <p className="mt-1 text-sm text-parchment/65">{item.body}</p>
          </Link>
        ))}
      </section>

      {profile ? (
        <section className="space-y-3">
          <h2 className="font-heading text-2xl font-bold">Your launches</h2>
          {!stories.length ? (
            <p className="text-sm text-parchment/60">
              None yet.{" "}
              <Link href="/launch/arc" className="text-arc hover:underline">
                Open the Arc press
              </Link>
              .
            </p>
          ) : (
            <ul className="grid gap-2">
              {stories.map((story) => (
                <li
                  key={story.slug}
                  className="glass flex items-center justify-between gap-3 rounded-2xl border border-white/10 px-4 py-3"
                >
                  <Link href={`/story/${story.slug}`} className="min-w-0 flex-1">
                    <span className="font-heading font-semibold">{story.title}</span>
                    <span className="ml-2 text-sm text-arc">
                      ${story.ticker} · {story.status}
                    </span>
                  </Link>
                  <Link href={`/bindings?story=${story.slug}`} className="shrink-0 text-sm text-arc hover:underline">
                    Link LP
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
