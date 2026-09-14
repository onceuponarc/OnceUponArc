import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PadBackground } from "@/components/pad/pad-background";
import { TabBar } from "@/components/pad/tab-bar";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { Providers } from "@/components/providers";
import { PwaRegister } from "@/components/pwa-register";

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
        <SiteFooter />
        <TabBar />
      </div>
    </Providers>
  );
}
