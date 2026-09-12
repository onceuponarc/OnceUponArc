import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export const metadata = { title: "OnceUponers" };

export default async function OnceUponersPage() {
  const supabase = await createClient();
  const { data: people, error } = await supabase
    .from("users")
    .select("handle, display_name, bio, portrait_url, storage_portrait_path")
    .order("last_login_at", { ascending: false })
    .limit(60);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">The club</p>
        <h1 className="font-heading mt-2 text-4xl">OnceUponers</h1>
        <p className="mt-2 text-parchment/70">A directory of handles, not a leaderboard of PnL.</p>
      </div>
      {error ? (
        <p className="text-burgundy">Could not read the shelf: {error.message}</p>
      ) : !people?.length ? (
        <p className="text-parchment/60">No one has signed the book yet. Be the first X login.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map((person) => {
            const portrait = person.storage_portrait_path ?? person.portrait_url;
            return (
              <li key={person.handle}>
                <Link
                  href={`/shelf/${person.handle}`}
                  className="flex items-center gap-3 rounded-xl border border-gold/20 bg-card p-3 hover:border-gold/50"
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
