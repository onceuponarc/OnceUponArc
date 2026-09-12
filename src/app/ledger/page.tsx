import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PIECE_EXPLAINER } from "@onceupon/config/copy";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata = { title: "The Ledger" };

export default async function LedgerPage() {
  const { profile } = await getSessionUser();
  const supabase = await createClient();

  const { data: live } = await supabase
    .from("stories")
    .select("slug, title, ticker, engine, vault_address")
    .eq("engine", "onceuponers")
    .in("status", ["live", "graduated"]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">The Ledger</p>
        <h1 className="font-heading mt-2 text-4xl">Claimable Pieces</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">{PIECE_EXPLAINER}</p>
      </div>

      {!profile ? (
        <Alert>
          <AlertTitle>Sign in to see your claims</AlertTitle>
          <AlertDescription>
            <Link href="/auth/login" className="text-gold hover:underline">
              Sign in with X
            </Link>
          </AlertDescription>
        </Alert>
      ) : null}

      {!live?.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">No vaults yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-parchment/70">
            OnceUponers-mode Stories will appear here with one claim button per Story. The vault has no
            owner. Staff cannot skim it.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {live.map((story) => (
            <Card key={story.slug}>
              <CardHeader>
                <CardTitle className="font-heading">{story.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                Vault {story.vault_address} — claim lands after Phase 2 contracts.
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
