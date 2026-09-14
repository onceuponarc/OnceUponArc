"use client";

export function ChapterJacket({
  ticker,
  title,
  blurb,
  coverUrl,
  status,
  handle,
  snipeTaxBps,
}: {
  ticker: string;
  title: string;
  blurb: string;
  coverUrl: string | null;
  status: string;
  handle?: string | null;
  snipeTaxBps: number;
}) {
  return (
    <div className="links-stage">
      <article className="links-card overflow-hidden rounded-[2rem] border border-white/15">
        <div
          className="links-card-face relative min-h-[280px] overflow-hidden rounded-[2rem] sm:min-h-[360px]"
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            event.currentTarget.style.setProperty("--rx", `${(-y * 8).toFixed(2)}deg`);
            event.currentTarget.style.setProperty("--ry", `${(x * 12).toFixed(2)}deg`);
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.setProperty("--rx", "0deg");
            event.currentTarget.style.setProperty("--ry", "0deg");
          }}
        >
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_42%),linear-gradient(160deg,#171717,#000)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />
          <div className="links-sheen pointer-events-none absolute inset-0" />
          <div className="relative flex min-h-[280px] flex-col justify-end p-6 sm:min-h-[360px] sm:p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/50">
              {status === "graduated" ? "Pool open" : "Chapter · curve"}
              {handle ? ` · @${handle}` : ""}
            </p>
            <h1 className="mt-2 text-5xl font-semibold tracking-tight sm:text-6xl">${ticker}</h1>
            <p className="mt-2 text-lg text-white/70">{title}</p>
            {blurb ? <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">{blurb}</p> : null}
            {snipeTaxBps > 0 && status !== "graduated" ? (
              <p className="mt-4 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/70">
                First prints carry a {(snipeTaxBps / 100).toFixed(2)}% snipe tax that decays
              </p>
            ) : null}
          </div>
        </div>
      </article>
    </div>
  );
}
