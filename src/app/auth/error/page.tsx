import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XMark } from "@/components/x-mark";

export const metadata = { title: "Sign in failed" };

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  const friendly =
    message && !/callback|tester|email|orbitx|portal|website url/i.test(message)
      ? message
      : "X did not complete sign-in. Try again in a moment.";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
      <div className="glass rounded-3xl border border-gold/25 p-8 sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">OnceUpon</p>
        <h1 className="font-heading mt-3 text-3xl font-bold">Sign in did not finish</h1>
        <p className="mt-3 text-parchment/75">{friendly}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              <XMark className="size-3.5" />
              Try X again
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Back to the pad</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
