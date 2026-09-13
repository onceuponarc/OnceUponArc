import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PIECE_EXPLAINER } from "@onceupon/config/copy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JupiterStatusRow } from "@/components/jupiter/status-row";
import { XMark } from "@/components/x-mark";
import Link from "next/link";

export const metadata = { title: "Claims" };

export default async function LedgerPage() {
  const { profile } = await getSessionUser();
  let live: { slug: string; title: string; ticker: string; engine: string; vault_address: string | null }[] | null =
    [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("stories")
      .select("slug, title, ticker, engine, vault_address")
      .eq("engine", "onceuponers")
      .in("status", ["live", "graduated"]);
    live = data;
  } catch (error) {
    console.error("Claims feed failed", error);
  }

  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl border border-gold/25 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">The Piece</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold">Claims</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">{PIECE_EXPLAINER}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <JupiterStatusRow />
        </div>
      </section>

      {!profile ? (
        <div className="glass rounded-2xl border border-gold/20 p-6">
          <h2 className="font-heading text-xl font-bold">Sign in to see your claims</h2>
          <Button asChild className="mt-4">
            <Link href="/auth/login">
              <XMark className="size-3.5" />
              Sign in with X
            </Link>
          </Button>
        </div>
      ) : null}

      {!live?.length ? (
        <Card>
          <CardHeader>
            <CardTitle>No vaults yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-parchment/70">
            OnceUponers-mode launches appear here with one claim per Story. The vault has no owner.
            Staff cannot skim it.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {live.map((story) => (
            <Card key={story.slug}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3">
                  <span>{story.title}</span>
                  <span className="text-sm text-gold">${story.ticker}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-parchment/70">
                Vault {story.vault_address ?? "pending"} — claim lands after Phase 2 contracts.
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
