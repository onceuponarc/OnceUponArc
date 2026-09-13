import { BindingForm } from "@/components/launch/binding-form";
import { getSessionUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Bindings" };

export default async function BindingsPage({
  searchParams,
}: {
  searchParams: Promise<{ story?: string }>;
}) {
  const { story: initialSlug } = await searchParams;
  const { user, profile } = await getSessionUser();
  let stories: { slug: string; title: string; ticker: string; quoteMint?: string | null; pairLabel?: string | null }[] =
    [];
  try {
    if (user) {
      const supabase = await createClient();
      const full = await supabase
        .from("stories")
        .select("slug, title, ticker, quote_mint, pair_label")
        .eq("author_user_id", user.id)
        .order("created_at", { ascending: false });
      const rows =
        full.data ??
        (full.error
          ? (
              await supabase
                .from("stories")
                .select("slug, title, ticker")
                .eq("author_user_id", user.id)
                .order("created_at", { ascending: false })
            ).data
          : null);
      stories = (rows ?? []).map((row) => ({
        slug: row.slug,
        title: row.title,
        ticker: row.ticker,
        quoteMint: "quote_mint" in row ? (row.quote_mint as string | null) : null,
        pairLabel: "pair_label" in row ? (row.pair_label as string | null) : null,
      }));
    }
  } catch (error) {
    console.error("Bindings load failed", error);
  }

  return (
    <div className="space-y-8">
      <section className="glass rounded-3xl border border-gold/25 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">The Binding</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold">Link a pool after print</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          Your mint is on Solana. Bind the live quote pool you launched against (NVDAx/USDC, SOL/USDC, and others),
          or paste an LP you opened for this token after launch. Pairing against a tokenized mint is a quote, not
          studio equity.
        </p>
      </section>
      <BindingForm signedIn={Boolean(profile)} stories={stories} initialSlug={initialSlug} />
    </div>
  );
}
