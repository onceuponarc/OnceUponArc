import { Button } from "@/components/ui/button";
import { XMark } from "@/components/x-mark";
import Link from "next/link";

export const metadata = { title: "Sign in with X" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
      <div className="glass rounded-3xl border border-arc/25 p-8 sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-arc">OnceUpon</p>
        <h1 className="font-heading mt-3 text-4xl font-bold">Sign in with X</h1>
        <p className="mt-3 text-parchment/75">
          Identity is X through Supabase. After you land, connect Phantom, Solflare, or Backpack — that
          address is bound to your handle. No in-app wallet. No email signup.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild className="w-full rounded-full">
            <a href="/auth/start">
              <XMark className="size-3.5" />
              Continue with X
            </a>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Back to the pad</Link>
          </Button>
        </div>
        <p className="mt-6 text-center text-xs text-parchment/45">No email signup. No password.</p>
      </div>
    </div>
  );
}
