"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { thirdwebClient } from "@/lib/thirdweb";
import { useActiveAccount, useSocialProfiles } from "thirdweb/react";

export function WalletSocialProfiles() {
  const account = useActiveAccount();
  const { data, isLoading, error } = useSocialProfiles({
    client: thirdwebClient,
    address: account?.address,
  });

  if (!account) {
    return (
      <p className="text-sm text-parchment/60">
        Connect an Arc wallet to load ENS, Lens, and Farcaster names for that address.
      </p>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-destructive">{error.message}</p>;
  }

  if (!data?.length) {
    return (
      <p className="text-sm text-parchment/60">
        No public social profiles on this address yet. The Shelf still uses the X handle.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {data.map((profile) => (
        <li
          key={`${profile.type}-${profile.name ?? "anon"}`}
          className="flex items-center gap-3 rounded-lg border border-gold/20 bg-card px-3 py-2"
        >
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar} alt="" className="size-8 rounded-full" />
          ) : (
            <span className="size-8 rounded-full bg-muted" />
          )}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.18em] text-gold">{profile.type}</p>
            <p className="truncate">{profile.name ?? "unnamed"}</p>
            {profile.bio ? (
              <p className="truncate text-xs text-parchment/60">{profile.bio}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
