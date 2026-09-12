"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { arcChain, hasThirdwebClientId, onceUponWallets, thirdwebClient } from "@/lib/thirdweb";
import {
  useActiveAccount,
  useActiveWallet,
  useConnect,
  useDisconnect,
  useWalletImage,
  useWalletInfo,
} from "thirdweb/react";

const WALLET_LABELS: Record<string, string> = {
  "io.metamask": "MetaMask",
  "io.rabby": "Rabby",
  "com.coinbase.wallet": "Coinbase Wallet",
  "me.rainbow": "Rainbow",
  walletConnect: "WalletConnect",
};

function WalletChoice({ wallet }: { wallet: (typeof onceUponWallets)[number] }) {
  const { connect, isConnecting, error } = useConnect();
  const { data: info } = useWalletInfo(hasThirdwebClientId ? wallet.id : undefined);
  const { data: image } = useWalletImage(hasThirdwebClientId ? wallet.id : undefined);
  const label = info?.name ?? WALLET_LABELS[wallet.id] ?? wallet.id;

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
        ) : hasThirdwebClientId ? (
          <Skeleton className="size-6 rounded-md" />
        ) : (
          <span className="flex size-6 items-center justify-center rounded-md bg-muted text-[10px] text-gold">
            {label.slice(0, 1)}
          </span>
        )}
        <span>{label}</span>
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
