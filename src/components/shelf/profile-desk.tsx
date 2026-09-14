"use client";

import { useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-in-button";
import { Button } from "@/components/ui/button";
import { formatCompact, formatUsd, timeAgo } from "@/lib/format";
import type { ProfileDesk } from "@/lib/profile-types";
import { cn } from "@/lib/utils";

type Tab = "launches" | "holds" | "activity";

export function ProfileDeskView({
  desk,
  isSelf,
}: {
  desk: ProfileDesk;
  isSelf: boolean;
}) {
  const [tab, setTab] = useState<Tab>("launches");
  const [copied, setCopied] = useState(false);
  const initial = desk.handle.slice(0, 1).toUpperCase();
  const publicPath = `/u/${desk.handle}`;

  async function copyPublic() {
    const url = `${window.location.origin}${publicPath}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `@${desk.handle} on OnceUpon`, url });
        return;
      }
    } catch {
      /* fall through to clipboard */
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="w-full space-y-5">
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-black">
        <div className="relative h-44 sm:h-56 lg:h-72">
          {desk.bannerUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={desk.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(255,255,255,0.18),transparent_42%),linear-gradient(120deg,#171717,#000)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
          <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
            <span
              className={cn(
                "rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em]",
                isSelf ? "bg-white text-black" : "border border-white/20 bg-black/50 text-white/80",
              )}
            >
              {isSelf ? "Your desk" : "Public profile"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 px-4 pb-6 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] lg:px-8">
          <div>
            <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
              <div className="size-24 overflow-hidden rounded-3xl border-4 border-black bg-neutral-800 sm:size-32">
                {desk.portraitUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={desk.portraitUrl} alt="" className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-4xl font-semibold text-white/70">
                    {initial}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pb-1">
                <Button variant="outline" onClick={() => void copyPublic()}>
                  {copied ? "Copied" : isSelf ? "Copy public link" : "Share profile"}
                </Button>
                {isSelf ? (
                  <>
                    <Button variant="outline" asChild>
                      <Link href={publicPath}>View public</Link>
                    </Button>
                    <SignOutButton />
                  </>
                ) : (
                  <Button asChild>
                    <a href={`https://x.com/${desk.handle}`} target="_blank" rel="noreferrer">
                      Follow on X
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {desk.displayName || desk.handle}
              </h1>
              <p className="mt-1 font-mono text-sm text-white/45">
                @{desk.handle} · once-upon-arc.vercel.app{publicPath}
              </p>
              <p className="mt-3 max-w-2xl text-base leading-7 text-white/70">
                {desk.bio ||
                  (isSelf
                    ? "This is your desk. Launch a Chapter and the tape writes itself."
                    : "Public OnceUpon desk. Chapters print on Arc. X is identity.")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:pt-4">
            <Stat label="Launches" value={String(desk.launchCount)} />
            <Stat label="Live" value={String(desk.liveCount)} />
            <Stat label="Fees" value={formatUsd(desk.feesUi)} />
            <Stat label="Launch vol" value={formatUsd(desk.volumeUi)} />
            <Stat label="Graduated" value={String(desk.graduatedCount)} />
            <Stat label="Traded" value={formatUsd(desk.tradedUi)} />
          </div>
        </div>
      </section>

      {isSelf ? (
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link href="/launch/arc">Launch a Chapter</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/wallet">Wallet</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/links">Share /links</Link>
          </Button>
        </div>
      ) : (
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">
          Visitor view · holdings are public tape, not a private wallet
        </p>
      )}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.9fr)]">
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <div className="flex border-b border-white/10">
            {(
              [
                ["launches", `Launches ${desk.launches.length}`],
                ["holds", `Holdings ${desk.holds.length}`],
                ["activity", "Tape"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex-1 px-3 py-3.5 text-sm text-white/45 hover:text-white",
                  tab === id && "bg-white/5 text-white",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "launches" ? (
            <div className="grid gap-3 p-3 sm:grid-cols-2">
              {!desk.launches.length ? (
                <p className="col-span-full px-3 py-10 text-sm text-white/45">
                  {isSelf ? "No Chapters yet. Print one from Launch." : "No public Chapters on this desk."}
                </p>
              ) : (
                desk.launches.map((row) => (
                  <Link
                    key={row.slug}
                    href={`/story/${row.slug}`}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] hover:border-white/25"
                  >
                    <div className="h-28 bg-white/5">
                      {row.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold">${row.ticker}</p>
                        <p className="font-mono text-[11px] uppercase text-white/40">{row.status}</p>
                      </div>
                      <p className="truncate text-sm text-white/50">{row.title}</p>
                      <p className="mt-2 text-xs text-white/40">
                        {formatUsd(row.volumeUi)} vol · {formatUsd(row.feesUi)} fees
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          ) : null}

          {tab === "holds" ? (
            <ul className="divide-y divide-white/10">
              {!desk.holds.length ? (
                <li className="px-4 py-10 text-sm text-white/45">No bags printed on this desk yet.</li>
              ) : (
                desk.holds.map((row) => (
                  <li key={row.slug}>
                    <Link href={`/story/${row.slug}`} className="flex items-center justify-between px-4 py-3.5 hover:bg-white/5">
                      <div>
                        <p className="font-semibold">${row.ticker}</p>
                        <p className="text-xs text-white/40">
                          spent {formatUsd(row.spentUi)} · sold {formatUsd(row.receivedUi)}
                        </p>
                      </div>
                      <p className="tabular-nums text-sm">{formatCompact(row.tokens)}</p>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          ) : null}

          {tab === "activity" ? <FillList desk={desk} /> : null}
        </div>

        <aside className="space-y-3">
          <div className="rounded-3xl border border-white/10 p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Recent tape</p>
            <div className="mt-3">
              <FillList desk={desk} compact />
            </div>
          </div>
          {!isSelf ? (
            <div className="rounded-3xl border border-white/10 p-4 text-sm text-white/55">
              You are visiting @{desk.handle}. Your own desk stays at{" "}
              <Link href="/you" className="text-white underline">
                /you
              </Link>
              .
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 p-4 text-sm text-white/55">
              Public link:{" "}
              <Link href={publicPath} className="text-white underline">
                {publicPath}
              </Link>
              . Visitors do not see wallet or sign-out.
            </div>
          )}
        </aside>
      </section>
    </div>
  );
}

function FillList({ desk, compact = false }: { desk: ProfileDesk; compact?: boolean }) {
  if (!desk.fills.length) {
    return <p className="px-1 py-6 text-sm text-white/45">Tape is quiet.</p>;
  }
  const rows = compact ? desk.fills.slice(0, 8) : desk.fills;
  return (
    <ul className="divide-y divide-white/10">
      {rows.map((row, index) => (
        <li key={`${row.txHash ?? row.at}-${index}`} className="flex items-center justify-between px-4 py-3 text-sm">
          <div>
            <p>
              <span className={row.side === "buy" ? "text-buy" : "text-sell"}>{row.side.toUpperCase()}</span>{" "}
              <Link href={`/story/${row.slug}`} className="font-semibold hover:underline">
                ${row.ticker}
              </Link>
            </p>
            <p className="text-xs text-white/35">{timeAgo(row.at)}</p>
          </div>
          <p className="tabular-nums">{formatUsd(row.quoteUi, 4)}</p>
        </li>
      ))}
    </ul>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
      <p className="text-lg font-semibold tabular-nums sm:text-xl">{value}</p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">{label}</p>
    </div>
  );
}
