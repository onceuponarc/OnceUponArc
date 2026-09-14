import { SiteHeader } from "@/components/site-header";
import { PadBackground } from "@/components/pad/pad-background";
import { TabBar } from "@/components/pad/tab-bar";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa-register";
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
    <Providers>
      <div className="relative flex min-h-full flex-col text-parchment">
        <PadBackground />
        <SiteHeader profile={profile} onlineCount={onlineCount} />
        <PwaRegister />
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-8 pt-5 sm:pt-8">{children}</main>
        <footer className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 pb-28 pt-4 text-center font-mono text-[11px] text-white/35">
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
          <Link href="/tools" className="hover:text-white">
            Tools
          </Link>
          <Link href="/links" className="hover:text-white">
            Links
          </Link>
          <Link href="/params" className="hover:text-white">
            Token
          </Link>
          <Link href="/week" className="hover:text-white">
            Week
          </Link>
          <Link href="/cards" className="hover:text-white">
            Cards
          </Link>
          <Link href="/drop" className="hover:text-white">
            Drop
          </Link>
          <span>Arc launchpad</span>
        </footer>
        <TabBar />
      </div>
    </Providers>
  );
}
