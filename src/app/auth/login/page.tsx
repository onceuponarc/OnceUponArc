import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

export const metadata = { title: "Sign in with X" };

const CALLBACK = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/callback`;

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-gold">The door</p>
        <h1 className="font-heading mt-2 text-4xl">Sign in with X</h1>
        <p className="mt-3 text-parchment/75">
          A OnceUponer is an X account. If X says you were not able to give access, the app
          callback is missing on the developer portal — not a bad password.
        </p>
      </div>

      <Alert>
        <AlertTitle>Add this callback first</AlertTitle>
        <AlertDescription>
          In the existing X app (keep the OrbitX callback), open User authentication settings and
          add:
          <code className="mt-2 block break-all text-gold">{CALLBACK}</code>
        </AlertDescription>
      </Alert>

      <ol className="list-decimal space-y-2 pl-5 text-sm text-parchment/80">
        <li>
          Developer Portal → the X app → <span className="text-parchment">User authentication settings</span> →
          Edit.
        </li>
        <li>
          Type of App must be <span className="text-parchment">Web App</span>. Use the OAuth 2.0 Client ID
          and Secret already on the OnceUpon Supabase project.
        </li>
        <li>
          Callback URI must include the URL above, exactly, with no trailing slash.
        </li>
        <li>
          Website URL: <code className="text-gold">http://127.0.0.1:43147</code>
        </li>
        <li>
          Turn on <span className="text-parchment">Request email from users</span>. Supabase always asks
          X for <code>users.email</code>.
        </li>
        <li>
          If the X project is in Development, only testers listed on that app can authorize.
        </li>
      </ol>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <a href="/auth/start">Continue to X</a>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Return to The Desk</Link>
        </Button>
      </div>
    </div>
  );
}
