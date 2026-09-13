export default function NotFound() {
  return (
    <div className="glass mx-auto max-w-lg space-y-3 rounded-3xl border border-gold/25 p-8">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold">OnceUpon</p>
      <h1 className="font-heading text-3xl font-bold">This page is not on the pad</h1>
      <p className="text-parchment/70">That route does not exist. Go home, or sign in with X to open your shelf.</p>
      <a href="/" className="inline-flex rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink">
        Back to the desk
      </a>
    </div>
  );
}
