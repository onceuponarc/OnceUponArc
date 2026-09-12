import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
          {message ?? "Supabase could not finish the X handshake."} If this is the first
          OnceUpon login, add{" "}
          <code className="text-gold">
            https://txrdfjypnuvlyseefclj.supabase.co/auth/v1/callback
          </code>{" "}
          to the existing X app callback list. Do not change the OrbitX product.
        </AlertDescription>
      </Alert>
      <Link href="/" className="text-gold hover:underline">
        Return to The Desk
      </Link>
    </div>
  );
}
