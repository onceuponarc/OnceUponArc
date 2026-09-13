import { SiteHeader } from "@/components/site-header";
import { PadBackground } from "@/components/pad/pad-background";
import { PadJupiterDock } from "@/components/jupiter/pad-jupiter-dock";
import { SilentErrorBoundary } from "@/components/silent-error-boundary";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { PAD_TAGLINE } from "@onceupon/config/copy";
import Link from "next/link";

export async function AppShell({ children }: { children: React.ReactNode }) {
  let profile = null as Awaited<ReturnType<typeof getSessionUser>>["profile"];
  let onlineCount = 0;
  try {
    const session = await getSessionUser();
    profile = session.profile;
    const supabase = await createClient();
    const { count } = await supabase.from("users").select("id", { count: "exact", head: true });
    onlineCount = count ?? 0;
  } catch (error) {
    console.error("AppShell failed", error);
  }

  return (
    <div className="relative flex min-h-full flex-col text-parchment">
      <PadBackground />
      <SiteHeader profile={profile} onlineCount={onlineCount} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8 sm:py-10">
        {children}
        <SilentErrorBoundary>
          <PadJupiterDock signedIn={Boolean(profile)} />
        </SilentErrorBoundary>
      </main>
      <footer className="mt-auto border-t border-gold/15 bg-ink/40 px-4 py-8 text-center text-xs text-parchment/55 backdrop-blur-xl">
        <p className="font-heading text-sm text-parchment/85">{PAD_TAGLINE}</p>
        <p className="mt-2">
          Identity is X via Supabase. The pad wallet lives in Supabase. Swaps route through Jupiter.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/launch" className="text-gold hover:underline">
            Launch
          </Link>
          <Link href="/launch/solana" className="text-gold hover:underline">
            Solana press
          </Link>
          <Link href="/wallet" className="text-gold hover:underline">
            Trade
          </Link>
          <Link href="/ledger" className="text-gold hover:underline">
            Claims
          </Link>
          <Link href="/bindings" className="text-gold hover:underline">
            Bindings
          </Link>
          <Link href="/margin" className="text-gold hover:underline">
            Margin
          </Link>
          <Link href="/chapter/the-first-chapter" className="text-gold hover:underline">
            First Chapter
          </Link>
        </div>
      </footer>
    </div>
  );
}
