import { PressForm } from "@/components/press-form";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MODE_COPY } from "@onceupon/config/copy";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export const metadata = { title: "The Press" };

export default async function WritePage() {
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
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">The Press</p>
        <h1 className="font-heading mt-2 text-4xl">Write a Story</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          {MODE_COPY.author.headline} — {MODE_COPY.author.body} {MODE_COPY.onceuponers.headline} —{" "}
          {MODE_COPY.onceuponers.body} The engine is immutable.
        </p>
      </div>

      {!profile ? (
        <Alert>
          <AlertTitle>Sign in with X first</AlertTitle>
          <AlertDescription>
            A OnceUponer is an X account.{" "}
            <Link href="/auth/login" className="text-gold hover:underline">
              Open the door
            </Link>
            .
          </AlertDescription>
        </Alert>
      ) : (
        <PressForm
          handle={profile.handle}
          primaryWallet={primaryWallet}
          verifiedAt={verifiedAt}
        />
      )}
    </div>
  );
}
