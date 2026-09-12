import { PressForm } from "@/components/press-form";
import { LaunchTypeGrid, PairStrip } from "@/components/pad/launch-types";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { BONDING_COPY } from "@onceupon/config/copy";
import { PROTOCOL } from "@onceupon/config/arc";
import { Button } from "@/components/ui/button";
import { XMark } from "@/components/x-mark";

export const metadata = { title: "Launch" };

export default async function LaunchPage() {
  const { user, profile } = await getSessionUser();
  const supabase = await createClient();
  let primaryWallet: string | null = null;
  let verifiedAt: string | null = null;

  if (user) {
    const { data } = await supabase
      .from("user_wallets")
      .select("address, verified_at, is_primary")
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .maybeSingle();
    primaryWallet = data?.address ?? null;
    verifiedAt = data?.verified_at ?? null;
  }

  return (
    <div className="space-y-10">
      <section className="glass relative overflow-hidden rounded-3xl border border-gold/25 px-6 py-10 sm:px-10">
        <div className="pointer-events-none absolute -right-10 top-0 size-56 rounded-full bg-burgundy/25 blur-3xl" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Launchpad</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold sm:text-5xl">Pick the engine. Print the token.</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          Two fee paths, locked forever at launch. Author keeps the flow. OnceUponers share it through The Piece.
          Tokenized RWA pairs stay gated until they actually list on Arc.
        </p>
        <p className="mt-2 max-w-2xl text-sm text-parchment/55">{BONDING_COPY}</p>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Launch types</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">How each one works</h2>
        </div>
        <LaunchTypeGrid detailed />
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Quote pairs</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">What you launch against</h2>
        </div>
        <PairStrip />
        <p className="text-sm text-parchment/55">
          Bonding graduates at {PROTOCOL.bondingGraduationUsdc.toLocaleString("en-US")} USDC. Protocol is about{" "}
          {(PROTOCOL.protocolBpsDefault / 100).toFixed(2)}% on every swap.
        </p>
      </section>

      <section className="space-y-4" id="compose">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Compose</p>
          <h2 className="font-heading mt-1 text-3xl font-bold">Ready when you are</h2>
        </div>
        {!profile ? (
          <div className="glass rounded-2xl border border-gold/25 p-8 text-center">
            <h3 className="font-heading text-2xl font-bold">Sign in with X to launch</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-parchment/65">
              Identity is your X handle. After sign-in you bind an Arc wallet, then save a draft.
            </p>
            <Button asChild size="lg" className="mt-6 h-11 px-5">
              <a href="/auth/login">
                <XMark className="size-4" />
                Sign in with X
              </a>
            </Button>
          </div>
        ) : (
          <PressForm
            handle={profile.handle}
            primaryWallet={primaryWallet}
            verifiedAt={verifiedAt}
          />
        )}
      </section>
    </div>
  );
}
