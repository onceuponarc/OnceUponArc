"use client";

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
  title: "Bind an Arc wallet",
  size: "compact" as const,
  showThirdwebBranding: false,
};

export function OnceUponConnectButton() {
  return (
    <ConnectButton
      client={thirdwebClient}
      chain={arcChain}
      chains={[arcChain]}
      wallets={onceUponWallets}
      theme={onceUponThirdwebTheme}
      appMetadata={onceUponAppMetadata}
      connectButton={{ label: "Connect Arc wallet" }}
      connectModal={connectModal}
      detailsButton={{
        displayBalanceToken: {
          [arcChain.id]: ARC_USDC_ERC20,
        },
      }}
    />
  );
}

export function OnceUponConnectEmbed() {
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
      header={{ title: "Bind an Arc wallet" }}
    />
  );
}
