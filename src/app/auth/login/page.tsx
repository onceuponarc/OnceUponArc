import { Button } from "@/components/ui/button";
import { XMark } from "@/components/x-mark";
import Link from "next/link";

export const metadata = { title: "Sign in with X" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
      <div className="glass rounded-3xl border border-gold/25 p-8 sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">OnceUpon</p>
        <h1 className="font-heading mt-3 text-4xl font-bold">Sign in with X</h1>
        <p className="mt-3 text-parchment/75">
          Your X handle is your identity on the pad. Bind an Arc wallet when you are ready to launch.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild size="lg" className="h-11 w-full text-base">
            <a href="/auth/start">
              <XMark className="size-4" />
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
