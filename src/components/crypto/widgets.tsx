"use client";

import { ClientOnly } from "@/components/client-only";
import {
  BridgeWidget,
  BuyWidget,
  CheckoutWidget,
  SwapWidget,
  TransactionButton,
  TransactionWidget,
  useActiveAccount,
} from "thirdweb/react";
import { prepareTransaction } from "thirdweb";
import { ARC_TESTNET } from "@onceupon/config/arc";
import {
  ARC_USDC_ERC20,
  arcChain,
  onceUponThirdwebTheme,
  thirdwebClient,
} from "@/lib/thirdweb";

export function OnceUponBuyUsdc() {
  return (
    <ClientOnly fallback={<div className="min-h-80 rounded-xl border border-gold/20 bg-card" />}>
      <BuyWidget
        client={thirdwebClient}
        chain={arcChain}
        tokenAddress={ARC_USDC_ERC20}
        amount="20"
        title="Buy Arc USDC"
        description="Quote asset for Stories. Pools use the 6-decimal ERC-20, not native gas."
        buttonLabel="Buy USDC"
        theme={onceUponThirdwebTheme}
        showThirdwebBranding={false}
        currency="USD"
      />
    </ClientOnly>
  );
}

export function OnceUponSwap() {
  return (
    <ClientOnly fallback={<div className="min-h-80 rounded-xl border border-gold/20 bg-card" />}>
      <SwapWidget
        client={thirdwebClient}
        theme={onceUponThirdwebTheme}
        showThirdwebBranding={false}
        prefill={{
          buyToken: {
            chainId: arcChain.id,
            tokenAddress: ARC_USDC_ERC20,
          },
          sellToken: {
            chainId: arcChain.id,
          },
        }}
      />
    </ClientOnly>
  );
}

export function OnceUponBridge() {
  return (
    <ClientOnly fallback={<div className="min-h-80 rounded-xl border border-gold/20 bg-card" />}>
      <BridgeWidget
        client={thirdwebClient}
        theme={onceUponThirdwebTheme}
        showThirdwebBranding={false}
      />
    </ClientOnly>
  );
}

export function OnceUponFaucetTx() {
  const account = useActiveAccount();
  if (!account) {
    return (
      <p className="text-sm text-parchment/60">
        Connect an Arc wallet to prepare on-chain actions. Factory launches use this button in Phase 1.
      </p>
    );
  }

  return (
    <TransactionButton
      theme={onceUponThirdwebTheme}
      payModal={false}
      transaction={() =>
        prepareTransaction({
          client: thirdwebClient,
          chain: arcChain,
          to: account.address,
          value: 0n,
        })
      }
    >
      Test Arc transaction
    </TransactionButton>
  );
}

export function OnceUponTxWidget() {
  const account = useActiveAccount();
  if (!account) {
    return (
      <p className="text-sm text-parchment/60">
        Connect an Arc wallet to open TransactionWidget. Launches will pay factory calldata here.
      </p>
    );
  }
  return (
    <TransactionWidget
      client={thirdwebClient}
      theme={onceUponThirdwebTheme}
      showThirdwebBranding={false}
      transaction={prepareTransaction({
        client: thirdwebClient,
        chain: arcChain,
        to: account.address,
        value: 0n,
      })}
      title="Pay an Arc action"
      description="Fiat or crypto, then the transaction. Launches will use this path."
    />
  );
}

export function OnceUponCheckout() {
  return (
    <ClientOnly fallback={<div className="min-h-80 rounded-xl border border-gold/20 bg-card" />}>
      <CheckoutWidget
        client={thirdwebClient}
        chain={arcChain}
        tokenAddress={ARC_USDC_ERC20}
        amount="1"
        seller={ARC_TESTNET.gateway.wallet}
        name="First Chapter rehearsal"
        description="A playground checkout. This is not a Story purchase and not studio equity."
        theme={onceUponThirdwebTheme}
        showThirdwebBranding={false}
      />
    </ClientOnly>
  );
}
