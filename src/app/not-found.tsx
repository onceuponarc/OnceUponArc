import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-3">
      <h1 className="font-heading text-4xl">This page was never bound</h1>
      <p className="text-parchment/70">No Story, shelf, or chapter lives at this address.</p>
      <Link href="/" className="text-gold hover:underline">
        Return to The Desk
      </Link>
    </div>
  );
}
