"use client";

import { ArcQuoteRow, WalletAccountCard } from "@/components/crypto/headless";
import { OnceUponSwap } from "@/components/crypto/widgets";
import { OnceUponConnectButton } from "@/components/crypto/connect";
import { useActiveAccount } from "thirdweb/react";

export function StoryTradePanel({ pairLabel }: { pairLabel: string }) {
  const account = useActiveAccount();

  return (
    <div className="space-y-4">
      <ArcQuoteRow />
      <p className="text-sm text-parchment/70">
        Pair quote is {pairLabel}. Buy USDC or swap into the quote, then trade the Story once the
        factory is live.
      </p>
      {account ? <WalletAccountCard address={account.address} /> : <OnceUponConnectButton />}
      <OnceUponSwap />
    </div>
  );
}
