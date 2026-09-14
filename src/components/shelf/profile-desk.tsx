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
  const initial = desk.handle.slice(0, 1).toUpperCase();

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-none border-x border-white/10 sm:rounded-2xl sm:border">
      <div className="relative h-36 bg-neutral-900 sm:h-48">
        {desk.bannerUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={desk.bannerUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_45%),linear-gradient(135deg,#141414,#000)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      </div>

      <div className="relative px-4 pb-6 sm:px-5">
        <div className="flex items-end justify-between">
          <div className="-mt-12 size-[88px] overflow-hidden rounded-2xl border-4 border-black bg-neutral-800 sm:-mt-14 sm:size-28">
            {desk.portraitUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={desk.portraitUrl} alt="" className="size-full object-cover object-center" />
            ) : (
              <div className="flex size-full items-center justify-center text-3xl font-semibold text-white/70">
                {initial}
              </div>
            )}
          </div>
          <div className="mb-1 flex gap-2">
            {isSelf ? (
              <>
                <Button variant="outline" asChild>
                  <Link href={`/shelf/${desk.handle}`}>Public</Link>
                </Button>
                <SignOutButton />
              </>
            ) : (
              <Button variant="outline" asChild>
                <a href={`https://x.com/${desk.handle}`} target="_blank" rel="noreferrer">
                  @{desk.handle}
                </a>
              </Button>
            )}
          </div>
        </div>

        <h1 className="mt-3 text-2xl font-bold tracking-tight">{desk.displayName || desk.handle}</h1>
        <p className="text-white/45">@{desk.handle}</p>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
          {desk.bio || "X is identity. Chapters print on Arc."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Launches" value={String(desk.launchCount)} />
          <Stat label="Fees made" value={formatUsd(desk.feesUi)} />
          <Stat label="Launch vol" value={formatUsd(desk.volumeUi)} />
          <Stat label="Traded" value={formatUsd(desk.tradedUi)} />
        </div>
        <p className="mt-2 text-[11px] text-white/35">
          {desk.liveCount} live · {desk.graduatedCount} graduated
        </p>

        <div className="mt-5 flex border-b border-white/10">
          {(
            [
              ["launches", "Launches"],
              ["holds", "Holdings"],
              ["activity", "Buys & sells"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "relative flex-1 py-3 text-sm font-medium text-white/45 transition-colors hover:text-white",
                tab === id && "text-white",
              )}
            >
              {label}
              {tab === id ? <span className="absolute inset-x-8 -bottom-px h-0.5 rounded-full bg-white" /> : null}
            </button>
          ))}
        </div>

        {tab === "launches" ? (
          <ul className="divide-y divide-white/10">
            {!desk.launches.length ? (
              <li className="py-8 text-sm text-white/45">No Chapters yet.</li>
            ) : (
              desk.launches.map((row) => (
                <li key={row.slug}>
                  <Link href={`/story/${row.slug}`} className="flex gap-3 py-3 hover:bg-white/5">
                    <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
                      {row.coverUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.coverUrl} alt="" className="size-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate font-semibold">${row.ticker}</p>
                        <p className="text-sm text-white/45">{row.status}</p>
                      </div>
                      <p className="truncate text-sm text-white/50">{row.title}</p>
                      <p className="mt-1 text-xs text-white/40">
                        {formatUsd(row.volumeUi)} vol · {formatUsd(row.feesUi)} fees · {row.authorBps / 100}% cut
                      </p>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        ) : null}

        {tab === "holds" ? (
          <ul className="divide-y divide-white/10">
            {!desk.holds.length ? (
              <li className="py-8 text-sm text-white/45">No bags on this pad yet.</li>
            ) : (
              desk.holds.map((row) => (
                <li key={row.slug}>
                  <Link href={`/story/${row.slug}`} className="flex items-center justify-between py-3 hover:bg-white/5">
                    <div>
                      <p className="font-semibold">${row.ticker}</p>
                      <p className="text-xs text-white/40">
                        spent {formatUsd(row.spentUi)} · sold {formatUsd(row.receivedUi)}
                      </p>
                    </div>
                    <p className="tabular-nums text-sm">{formatCompact(row.tokens)} tokens</p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        ) : null}

        {tab === "activity" ? (
          <ul className="divide-y divide-white/10">
            {!desk.fills.length ? (
              <li className="py-8 text-sm text-white/45">No buys or sells recorded.</li>
            ) : (
              desk.fills.map((row, index) => (
                <li key={`${row.txHash ?? row.at}-${index}`} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p>
                      <span className={row.side === "buy" ? "text-buy" : "text-sell"}>
                        {row.side.toUpperCase()}
                      </span>{" "}
                      <Link href={`/story/${row.slug}`} className="font-semibold hover:underline">
                        ${row.ticker}
                      </Link>
                    </p>
                    <p className="text-xs text-white/35">{timeAgo(row.at)}</p>
                  </div>
                  <p className="tabular-nums">{formatUsd(row.quoteUi, 4)}</p>
                </li>
              ))
            )}
          </ul>
        ) : null}

        {isSelf ? (
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button asChild variant="outline">
              <Link href="/wallet">Wallet</Link>
            </Button>
            <Button asChild>
              <Link href="/launch/arc">Launch</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">{label}</p>
    </div>
  );
}
