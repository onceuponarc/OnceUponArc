import { OFFICIAL_TOKEN } from "@/lib/official-token";

export function ChannelStrip() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {OFFICIAL_TOKEN.channels.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-3xl border border-white/10 px-5 py-4 hover:border-white/30"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">{link.label}</p>
          <p className="mt-1 truncate text-lg font-semibold">{link.href.replace("https://", "")}</p>
        </a>
      ))}
    </div>
  );
}
