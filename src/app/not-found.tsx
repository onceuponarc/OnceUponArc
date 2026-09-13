import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="glass mx-auto max-w-lg space-y-4 rounded-3xl border border-gold/25 p-8">
      <h1 className="font-heading text-4xl font-bold">Nothing launches here</h1>
      <p className="text-parchment/70">No token, profile, or window lives at this address.</p>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/launch/solana">Solana press</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/launch">All chains</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/">The Desk</Link>
        </Button>
      </div>
    </div>
  );
}
