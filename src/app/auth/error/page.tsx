import { PUBLIC_SITE_URL } from "@onceupon/config/urls";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const CALLBACK = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`;

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;
  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="font-heading text-3xl">The door did not open</h1>
      <Alert>
        <AlertTitle>Sign in with X failed</AlertTitle>
        <AlertDescription>
          {message ??
            "X refused the app. That almost always means the callback below is missing from User authentication settings."}{" "}
          Keep the OrbitX callback. Add:
          <code className="mt-2 block break-all text-gold">{CALLBACK}</code>
          Also turn on Request email from users, set Website URL to{" "}
          <code className="text-gold">{PUBLIC_SITE_URL}/</code>, and if the X project is in
          Development, add your account as a tester.
        </AlertDescription>
      </Alert>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/auth/login">Try again</Link>
        </Button>
        <Link href="/" className="text-gold hover:underline">
          Return to The Desk
        </Link>
      </div>
    </div>
  );
}
