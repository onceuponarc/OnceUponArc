import { MARGIN_DISCLAIMER } from "@onceupon/config/copy";
import { JUPITER } from "@onceupon/config/solana";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { MarginIntentForm } from "@/components/margin-intent-form";

export const metadata = { title: "Margin" };

const MARKETS = [
  { id: "BTC-PERP", label: "BTC", href: `${JUPITER.perps}/BTC` },
  { id: "SOL-PERP", label: "SOL", href: `${JUPITER.perps}/SOL` },
  { id: "ETH-PERP", label: "ETH", href: `${JUPITER.perps}/ETH` },
];

export default async function MarginPage() {
  const { profile } = await getSessionUser();

  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl border border-gold/25 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Perps doorway</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold">Margin</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">{MARGIN_DISCLAIMER}</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {MARKETS.map((market) => (
          <Card key={market.id}>
            <CardHeader>
              <CardTitle>{market.label}</CardTitle>
              <CardDescription>{market.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href={market.href} target="_blank" rel="noreferrer">
                  Open on Jupiter
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {profile ? <MarginIntentForm /> : null}
    </div>
  );
}
