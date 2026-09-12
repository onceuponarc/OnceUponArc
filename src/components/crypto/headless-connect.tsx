"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { arcChain, onceUponWallets, thirdwebClient } from "@/lib/thirdweb";
import {
  useActiveAccount,
  useActiveWallet,
  useConnect,
  useDisconnect,
  useWalletImage,
  useWalletInfo,
} from "thirdweb/react";

function WalletChoice({ wallet }: { wallet: (typeof onceUponWallets)[number] }) {
  const { connect, isConnecting, error } = useConnect();
  const { data: info } = useWalletInfo(wallet.id);
  const { data: image } = useWalletImage(wallet.id);

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant="outline"
        className="h-auto w-full justify-start gap-3 px-3 py-2"
        disabled={isConnecting}
        onClick={() =>
          connect(async () => {
            await wallet.connect({ client: thirdwebClient, chain: arcChain });
            return wallet;
          })
        }
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="size-6 rounded-md" />
        ) : (
          <Skeleton className="size-6 rounded-md" />
        )}
        <span>{info?.name ?? wallet.id}</span>
      </Button>
      {error ? <p className="text-xs text-destructive">{error.message}</p> : null}
    </div>
  );
}

export function HeadlessArcConnect() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  if (account && wallet) {
    return (
      <div className="space-y-3">
        <p className="break-all font-mono text-sm text-parchment/80">{account.address}</p>
        <Button type="button" variant="secondary" onClick={() => disconnect(wallet)}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {onceUponWallets.map((item) => (
        <WalletChoice key={item.id} wallet={item} />
      ))}
      <p className="text-xs text-parchment/55">
        Headless Connect from the playground. Identity stays X — these are EOAs only, no email wallets.
      </p>
    </div>
  );
}
