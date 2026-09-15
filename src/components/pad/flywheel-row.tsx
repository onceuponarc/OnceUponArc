import Link from "next/link";

const STEPS = [
  {
    href: "/launch/arc",
    kicker: "01",
    title: "Chapter",
    body: "USDC curve. Tradable at create. Graduate when the book fills.",
  },
  {
    href: "/cards/new",
    kicker: "02",
    title: "NFT Card",
    body: "3D card from a tweet or ticker. Price tracks that Chapter MC.",
  },
  {
    href: "/week",
    kicker: "03",
    title: "Flywheel",
    body: "Creator cut, holder claims, weekly burn. Coin and card stay separate.",
  },
];

export function FlywheelRow() {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {STEPS.map((step) => (
        <Link key={step.href} href={step.href} className="rounded-3xl border border-white/10 p-5 hover:border-white/25">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">{step.kicker}</p>
          <p className="mt-2 text-2xl font-semibold">{step.title}</p>
          <p className="mt-2 text-sm text-white/50">{step.body}</p>
        </Link>
      ))}
    </div>
  );
}
