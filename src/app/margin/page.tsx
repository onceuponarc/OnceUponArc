import { MARGIN_DISCLAIMER } from "@onceupon/config/copy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const metadata = { title: "Margin" };

export default function MarginPage() {
  return (
    <div className="space-y-6">
      <section className="glass rounded-3xl border border-gold/25 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">Not the book</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold">Margin</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">{MARGIN_DISCLAIMER}</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>OnceUpon prints on Arc</CardTitle>
          <CardDescription>
            Chapters trade on the curve in USDC. There is no perps book here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/wallet">Open Trade</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
