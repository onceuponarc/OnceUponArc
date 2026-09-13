import { BindingForm } from "@/components/launch/binding-form";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Bindings" };

export default async function BindingsPage() {
  const { user, profile } = await getSessionUser();
  let stories: { slug: string; title: string; ticker: string }[] = [];
  try {
    if (user) {
      const supabase = await createClient();
      const { data } = await supabase
        .from("stories")
        .select("slug, title, ticker")
        .eq("author_user_id", user.id)
        .order("created_at", { ascending: false });
      stories = data ?? [];
    }
  } catch (error) {
    console.error("Bindings load failed", error);
  }

  return (
    <div className="space-y-8">
      <section className="glass rounded-3xl border border-gold/25 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">The Binding</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold">Link a foreign pool</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          Tokens print on Solana. At launch — and any time after — Authors attach a live pool on Arc,
          Solana, Ethereum, Base, or Robinhood Chain. Raydium, Orca, Meteora, Uniswap, Aerodrome, Pons, or
          paste any pair. This is a record of The Binding, not a claim that the token minted on that chain.
        </p>
      </section>
      <BindingForm signedIn={Boolean(profile)} stories={stories ?? []} />
    </div>
  );
}
