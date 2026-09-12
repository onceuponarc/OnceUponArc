"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  AccountAddress,
  AccountAvatar,
  AccountBalance,
  AccountBlobbie,
  AccountName,
  AccountProvider,
  ChainIcon,
  ChainName,
  ChainProvider,
  NFTDescription,
  NFTMedia,
  NFTName,
  NFTProvider,
  TokenIcon,
  TokenName,
  TokenProvider,
  TokenSymbol,
} from "thirdweb/react";
import { NATIVE_TOKEN_ADDRESS, getContract } from "thirdweb";
import { shortenAddress } from "thirdweb/utils";
import {
  ARC_EURC,
  ARC_USDC_ERC20,
  arcChain,
  thirdwebClient,
} from "@/lib/thirdweb";

type HexAddress = `0x${string}`;

function LoadingMark() {
  return <Skeleton className="h-4 w-16" />;
}

export function ArcChainChip() {
  return (
    <ChainProvider chain={arcChain}>
      <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-card px-3 py-1.5 text-sm">
        <ChainIcon
          client={thirdwebClient}
          className="size-5 rounded-full"
          loadingComponent={<Skeleton className="size-5 rounded-full" />}
        />
        <ChainName loadingComponent={<LoadingMark />} />
      </span>
    </ChainProvider>
  );
}

export function ArcTokenChip({
  address,
  label,
}: {
  address: HexAddress;
  label?: string;
}) {
  return (
    <TokenProvider address={address} client={thirdwebClient} chain={arcChain}>
      <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-card px-3 py-1.5 text-sm">
        <TokenIcon
          className="size-5 rounded-full"
          loadingComponent={<Skeleton className="size-5 rounded-full" />}
        />
        <span className="font-medium">
          {label ?? <TokenSymbol loadingComponent={<LoadingMark />} />}
        </span>
        <span className="text-parchment/60">
          <TokenName loadingComponent={<LoadingMark />} />
        </span>
      </span>
    </TokenProvider>
  );
}

export function ArcQuoteRow() {
  return (
    <div className="flex flex-wrap gap-2">
      <ArcChainChip />
      <ArcTokenChip address={NATIVE_TOKEN_ADDRESS} label="gas USDC" />
      <ArcTokenChip address={ARC_USDC_ERC20} label="pool USDC" />
      <ArcTokenChip address={ARC_EURC} label="EURC" />
    </div>
  );
}

export function WalletAccountCard({ address }: { address: string }) {
  return (
    <AccountProvider address={address} client={thirdwebClient}>
      <div className="flex items-center gap-3 rounded-xl border border-gold/20 bg-card p-3">
        <div className="size-12 overflow-hidden rounded-full">
          <AccountAvatar
            className="size-12 rounded-full"
            loadingComponent={<AccountBlobbie className="size-12 rounded-full" />}
            fallbackComponent={<AccountBlobbie className="size-12 rounded-full" />}
          />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">
            <AccountName loadingComponent={<LoadingMark />} />
          </p>
          <p className="truncate font-mono text-xs text-parchment/60">
            <AccountAddress formatFn={shortenAddress} />
          </p>
          <p className="text-sm text-gold">
            <AccountBalance
              chain={arcChain}
              tokenAddress={ARC_USDC_ERC20}
              loadingComponent={<LoadingMark />}
            />
          </p>
        </div>
      </div>
    </AccountProvider>
  );
}

export function StoryCoverNft({
  address,
  tokenId,
}: {
  address: HexAddress;
  tokenId: bigint;
}) {
  const contract = getContract({ client: thirdwebClient, chain: arcChain, address });
  return (
    <NFTProvider tokenId={tokenId} contract={contract}>
      <div className="flex w-full max-w-[230px] flex-col gap-3 rounded-lg border border-gold/25 bg-card px-2 py-3">
        <NFTMedia
          className="rounded-md"
          loadingComponent={<Skeleton className="h-40 w-full" />}
        />
        <NFTName className="px-1 font-heading" loadingComponent={<LoadingMark />} />
        <NFTDescription
          className="px-1 text-sm text-parchment/70"
          loadingComponent={<LoadingMark />}
        />
      </div>
    </NFTProvider>
  );
}
