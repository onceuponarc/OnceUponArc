import { ArcDevnetWallet } from "@/components/arc/devnet-wallet";
import { getSessionUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { XMark } from "@/components/x-mark";
import Link from "next/link";

export const metadata = { title: "Trade" };

export default async function WalletPage() {
  const { profile } = await getSessionUser();

  return (
    <div className="space-y-6">
      <section className="glass rounded-[28px] border border-arc/25 p-6 sm:p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">Trade</p>
        <h1 className="font-heading mt-2 text-4xl font-extrabold">Arc Chapter Curve</h1>
        <p className="mt-3 max-w-2xl text-parchment/75">
          The funded Arc test wallet signs buy and sell. Quote is USDC. Your USDC stays in the book until graduation.
          OnceUpon is an Arc launchpad.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button asChild className="rounded-full">
            <Link href="/launch/arc">Open a Chapter</Link>
          </Button>
        </div>
      </section>
      <ArcDevnetWallet />
      {!profile ? (
        <div className="glass rounded-2xl border border-arc/20 p-5">
          <h2 className="font-heading text-xl font-bold">Sign in with X</h2>
          <p className="mt-2 text-sm text-parchment/65">Identity is X. The Arc Devnet wallet prints and trades.</p>
          <Button asChild className="mt-4 rounded-full">
            <Link href="/auth/login">
              <XMark className="size-3.5" />
              Sign in with X
            </Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
