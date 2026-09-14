import Link from "next/link";

export function DropBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-black px-5 py-6 sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.16),transparent_42%),radial-gradient(circle_at_100%_100%,rgba(255,255,255,0.08),transparent_40%)]" />
      <div className="links-sheen pointer-events-none absolute inset-0" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">Launch day</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">
            Print a Chapter. Print a jacket. Let MC move both.
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/55 sm:text-base">
            Coin trades on the USDC curve. Card value is start price × live MC / start MC. Two markets. One story.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/launch/arc" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black">
            Launch
          </Link>
          <Link href="/cards/new" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white">
            Print card
          </Link>
          <Link href="/drop" className="rounded-full border border-white/20 px-4 py-2 text-sm text-white">
            Drop page
          </Link>
        </div>
      </div>
    </section>
  );
}
