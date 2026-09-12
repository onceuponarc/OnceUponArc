import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { TAGLINE } from "@onceupon/config/copy";
import Link from "next/link";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const { profile } = await getSessionUser();
  const supabase = await createClient();
  const { count } = await supabase
    .from("users")
    .select("id", { count: "exact", head: true });

  return (
    <div className="flex min-h-full flex-col bg-ink text-parchment">
      <SiteHeader profile={profile} onlineCount={count ?? 0} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-gold/20 px-4 py-6 text-center text-xs text-parchment/50">
        <p className="font-heading text-sm text-parchment/80">{TAGLINE}</p>
        <p className="mt-2">
          Settlement on Circle Arc testnet. Identity is X. Money lives on-chain.
        </p>
        <p className="mt-1">
          <Link href="/chapter/the-first-chapter" className="text-gold hover:underline">
            The First Chapter
          </Link>
        </p>
      </footer>
    </div>
  );
}
