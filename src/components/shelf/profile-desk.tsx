"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-in-button";
import { FollowXButton } from "@/components/shelf/follow-x-button";
import { Button } from "@/components/ui/button";
import { formatCompact, formatUsd, timeAgo } from "@/lib/format";
import type { ProfileDesk } from "@/lib/profile-types";
import { cn } from "@/lib/utils";

type Tab = "launches" | "cards" | "holds" | "activity";

export function ProfileDeskView({
  desk,
  isSelf,
}: {
  desk: ProfileDesk;
  isSelf: boolean;
}) {
  const [tab, setTab] = useState<Tab>("launches");
  const [copied, setCopied] = useState(false);
  const [live, setLive] = useState<{ avatarUrl: string | null; bannerUrl: string | null; name: string; bio: string } | null>(
    null,
  );
  const publicPath = `/u/${desk.handle}`;

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/x-profile?handle=${encodeURIComponent(desk.handle)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setLive(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [desk.handle]);

  const portrait = live?.avatarUrl || desk.portraitUrl;
  const banner = live?.bannerUrl || desk.bannerUrl;
  const name = live?.name || desk.displayName || desk.handle;
  const bio =
    desk.bio ||
    live?.bio ||
    (isSelf
      ? "This is your desk. Launch a Chapter and the tape writes itself."
      : "Public OrbitX desk. Chapters print on Arc. X is identity.");

  async function copyPublic() {
    const url = `${window.location.origin}${publicPath}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `@${desk.handle} on OrbitX`, url });
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
        <div className="relative h-48 sm:h-64 lg:h-80">
          <SafeImg
            src={banner}
            fallback="/brand/banner.jpg"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
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
          <div className="absolute bottom-4 left-4 size-24 overflow-hidden rounded-3xl border-4 border-black bg-neutral-900 sm:bottom-5 sm:left-6 sm:size-32">
            <SafeImg
              src={portrait}
              fallback={`https://unavatar.io/twitter/${desk.handle}`}
              lastResort="/brand/logo.jpg"
              className="size-full object-cover"
            />
          </div>
        </div>

        <div className="grid gap-6 px-4 pb-6 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] lg:px-8">
          <div>
            <div className="flex flex-wrap items-start justify-center gap-2 pt-4 sm:justify-end">
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
                  <FollowXButton handle={desk.handle} />
                )}
            </div>

            <div className="mt-4 text-center sm:text-left">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {name}
              </h1>
              <p className="mt-1 font-mono text-sm text-white/45">
                @{desk.handle}
              </p>
              <p className="mx-auto mt-1 max-w-xl font-mono text-[11px] text-white/30 sm:mx-0">
                www.orbitx.world{publicPath}
              </p>
              <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-white/70 sm:mx-0">{bio}</p>
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
        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
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
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-white/35 sm:text-left">
          Public desk · holdings are tape, not a private wallet
        </p>
      )}

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.9fr)]">
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <div className="flex border-b border-white/10">
            {(
              [
                ["launches", `Launches ${desk.launches.length}`],
                ["cards", `Cards ${desk.cards.length}`],
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

          {tab === "cards" ? (
            <div className="grid gap-3 p-3 sm:grid-cols-2">
              {!desk.cards.length ? (
                <p className="col-span-full px-3 py-12 text-center text-sm text-white/45">
                  {isSelf ? "No jackets yet. Print one from /cards/new." : "No press cards on this desk."}
                </p>
              ) : (
                desk.cards.map((row) => (
                  <Link key={row.slug} href={`/cards/${row.slug}`} className="overflow-hidden rounded-2xl border border-white/10">
                    <div className="h-28 bg-white/5">
                      {row.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.coverUrl} alt="" className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="p-3">
                      <p className="font-semibold">${row.ticker}</p>
                      <p className="text-sm text-white/50">{row.title}</p>
                      <p className="mt-1 font-mono text-[11px] uppercase text-white/35">
                        {row.owner ? "Held" : "Created"} · {row.listed ? "listed" : "unlisted"}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          ) : null}

          {tab === "launches" ? (
            <div className="grid gap-3 p-3 sm:grid-cols-2">
              {!desk.launches.length ? (
                <p className="col-span-full px-3 py-12 text-center text-sm text-white/45">
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
                <li className="px-4 py-12 text-center text-sm text-white/45">No bags printed on this desk yet.</li>
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
            <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">Recent tape</p>
            <div className="mt-3">
              <FillList desk={desk} compact />
            </div>
          </div>
          {!isSelf ? (
            <div className="rounded-3xl border border-white/10 p-4 text-center text-sm text-white/55">
              You are visiting @{desk.handle}. Your own desk stays at{" "}
              <Link href="/you" className="text-white underline">
                /you
              </Link>
              .
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 p-4 text-center text-sm text-white/55">
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

function SafeImg({
  src,
  fallback,
  lastResort,
  className,
}: {
  src: string | null | undefined;
  fallback: string;
  lastResort?: string;
  className?: string;
}) {
  const [current, setCurrent] = useState(src || fallback);
  useEffect(() => {
    setCurrent(src || fallback);
  }, [src, fallback]);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt=""
      className={className}
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
        else if (lastResort && current !== lastResort) setCurrent(lastResort);
      }}
    />
  );
}

function FillList({ desk, compact = false }: { desk: ProfileDesk; compact?: boolean }) {
  if (!desk.fills.length) {
    return <p className="px-4 py-10 text-center text-sm text-white/45">Tape is quiet.</p>;
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-center">
      <p className="text-lg font-semibold tabular-nums sm:text-xl">{value}</p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">{label}</p>
    </div>
  );
}
