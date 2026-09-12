"use client";

import { ClientOnly } from "@/components/client-only";
import { WalletAccountCard } from "@/components/crypto/headless";
import {
  ConnectButton,
  ConnectEmbed,
  useActiveAccount,
} from "thirdweb/react";
import {
  arcChain,
  onceUponAppMetadata,
  onceUponThirdwebTheme,
  onceUponWallets,
  thirdwebClient,
  ARC_USDC_ERC20,
} from "@/lib/thirdweb";

const connectModal = {
  title: "Connect a wallet",
  size: "compact" as const,
  showThirdwebBranding: false,
};

export function OnceUponConnectButton() {
  return (
    <ClientOnly
      fallback={
        <span
          className="inline-block h-[50px] min-w-[165px] rounded-lg border border-gold/20 bg-card"
          aria-hidden
        />
      }
    >
      <ConnectButton
        client={thirdwebClient}
        chain={arcChain}
        chains={[arcChain]}
        wallets={onceUponWallets}
        theme={onceUponThirdwebTheme}
        appMetadata={onceUponAppMetadata}
        connectButton={{ label: "Connect wallet" }}
        connectModal={connectModal}
        detailsButton={{
          displayBalanceToken: {
            [arcChain.id]: ARC_USDC_ERC20,
          },
        }}
      />
    </ClientOnly>
  );
}

export function OnceUponConnectEmbed() {
  return (
    <ClientOnly fallback={<span className="block min-h-48 rounded-xl border border-gold/20 bg-card" />}>
      <OnceUponConnectEmbedLive />
    </ClientOnly>
  );
}

function OnceUponConnectEmbedLive() {
  const account = useActiveAccount();
  if (account) {
    return <WalletAccountCard address={account.address} />;
  }

  return (
    <ConnectEmbed
      client={thirdwebClient}
      chain={arcChain}
      chains={[arcChain]}
      wallets={onceUponWallets}
      theme={onceUponThirdwebTheme}
      appMetadata={onceUponAppMetadata}
      showThirdwebBranding={false}
      header={{ title: "Connect a wallet" }}
    />
  );
}
