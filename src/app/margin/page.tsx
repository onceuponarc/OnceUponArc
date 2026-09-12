import { MARGIN_DISCLAIMER } from "@onceupon/config/copy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { MarginIntentForm } from "@/components/margin-intent-form";
import { OnceUponConnectButton } from "@/components/crypto/connect";
import { ArcQuoteRow } from "@/components/crypto/headless";
import { OnceUponBuyUsdc } from "@/components/crypto/widgets";

export const metadata = { title: "The Margin" };

const MARKETS = [
  { id: "BTC-PERP", label: "BTC", href: "https://jup.ag" },
  { id: "SOL-PERP", label: "SOL", href: "https://jup.ag" },
  { id: "ETH-PERP", label: "ETH", href: "https://jup.ag" },
];

export default async function MarginPage() {
  const { profile } = await getSessionUser();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">The Margin</p>
        <h1 className="font-heading mt-2 text-4xl">Longs and shorts on Jupiter</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">{MARGIN_DISCLAIMER}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {MARKETS.map((market) => (
          <Card key={market.id}>
            <CardHeader>
              <CardTitle className="font-heading">{market.label}</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Fund on Arc first</CardTitle>
          <CardDescription>
            Jupiter still holds the perp. Buy pool USDC here, then record the intent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ArcQuoteRow />
          <OnceUponConnectButton />
          <OnceUponBuyUsdc />
        </CardContent>
      </Card>

      {profile ? <MarginIntentForm /> : null}
    </div>
  );
}
