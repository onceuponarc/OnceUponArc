import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyPad } from "@/components/pad/launch-card";
import Link from "next/link";

export const metadata = { title: "Crew" };

export default async function OnceUponersPage() {
  let people: {
    handle: string;
    display_name: string;
    bio: string | null;
    portrait_url: string | null;
    storage_portrait_path: string | null;
  }[] | null = [];
  let error: { message: string } | null = null;
  try {
    const supabase = await createClient();
    const result = await supabase
      .from("users")
      .select("handle, display_name, bio, portrait_url, storage_portrait_path")
      .order("last_login_at", { ascending: false })
      .limit(60);
    people = result.data;
    error = result.error ? { message: result.error.message } : null;
  } catch (err) {
    console.error("Crew feed failed", err);
    error = { message: "Supabase did not answer." };
  }

  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl border border-gold/25 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Crew</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold">OnceUponers</h1>
        <p className="mt-2 text-parchment/70">Handles on the pad — not a PnL leaderboard.</p>
      </section>
      {error ? (
        <p className="text-burgundy">Could not load the crew: {error.message}</p>
      ) : !people?.length ? (
        <EmptyPad
          title="No one is here yet"
          body="Be the first X login. Your handle becomes your identity on the pad."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => {
            const portrait = person.storage_portrait_path ?? person.portrait_url;
            return (
              <li key={person.handle}>
                <Link
                  href={`/u/${person.handle}`}
                  className="glass flex items-center gap-3 rounded-2xl border border-gold/20 p-3 transition hover:border-gold/50"
                >
                  <Avatar>
                    {portrait ? <AvatarImage src={portrait} alt="" /> : null}
                    <AvatarFallback>{person.handle.slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{person.display_name}</p>
                    <p className="text-sm text-gold">@{person.handle}</p>
                    <p className="line-clamp-2 text-xs text-parchment/60">{person.bio}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
