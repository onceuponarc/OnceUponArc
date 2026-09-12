import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const hasKey =
  Boolean(process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID) &&
  process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID !== "onceupon_replace_me";

export function ThirdwebKeyNotice({ surface }: { surface?: string }) {
  if (hasKey) return null;
  return (
    <Alert>
      <AlertTitle>{surface ? `${surface} needs a thirdweb key` : "Add a thirdweb client ID"}</AlertTitle>
      <AlertDescription>
        Create a key at{" "}
        <a className="text-gold hover:underline" href="https://thirdweb.com/create-api-key">
          thirdweb.com/create-api-key
        </a>
        , allow <span className="font-mono">localhost:43147</span> and{" "}
        <span className="font-mono">once-upon-arc.vercel.app</span>, and set{" "}
        <span className="font-mono">NEXT_PUBLIC_THIRDWEB_CLIENT_ID</span>. Connect still lists Arc
        wallets. Buy, Swap, Bridge, and Checkout wait on the key.
      </AlertDescription>
    </Alert>
  );
}
