"use client";

import { ClientOnly } from "@/components/client-only";
import { OnceUponConnectButton, OnceUponConnectEmbed } from "@/components/crypto/connect";
import { HeadlessArcConnect } from "@/components/crypto/headless-connect";
import { ArcQuoteRow, WalletAccountCard } from "@/components/crypto/headless";
import { WalletSocialProfiles } from "@/components/crypto/social";
import {
  OnceUponBridge,
  OnceUponBuyUsdc,
  OnceUponCheckout,
  OnceUponFaucetTx,
  OnceUponSwap,
  OnceUponTxWidget,
} from "@/components/crypto/widgets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveAccount } from "thirdweb/react";

export function CryptoPlayground() {
  return (
    <ClientOnly fallback={<div className="min-h-[24rem] rounded-xl border border-gold/20 bg-card" />}>
      <CryptoPlaygroundLive />
    </ClientOnly>
  );
}

function CryptoPlaygroundLive() {
  const account = useActiveAccount();

  return (
    <div className="space-y-8">
      <Tabs defaultValue="connect">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="connect">Connect</TabsTrigger>
          <TabsTrigger value="headless">Headless</TabsTrigger>
          <TabsTrigger value="buy">Buy</TabsTrigger>
          <TabsTrigger value="swap">Swap</TabsTrigger>
          <TabsTrigger value="bridge">Bridge</TabsTrigger>
          <TabsTrigger value="checkout">Checkout</TabsTrigger>
          <TabsTrigger value="tx">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="connect" className="space-y-6 pt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">ConnectButton</CardTitle>
                <CardDescription>
                  Same control as the header. Compact modal, no thirdweb badge, Arc-only wallets.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <OnceUponConnectButton />
                {account ? <WalletAccountCard address={account.address} /> : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">ConnectEmbed</CardTitle>
                <CardDescription>
                  Inline connect. After a session exists it shows the account card instead of an empty slot.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OnceUponConnectEmbed />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="headless" className="space-y-6 pt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Headless Connect</CardTitle>
                <CardDescription>useConnect / useDisconnect with the playground wallet set.</CardDescription>
              </CardHeader>
              <CardContent>
                <HeadlessArcConnect />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Account, chain, token</CardTitle>
                <CardDescription>
                  Headless chips for Arc, native gas USDC (18 dp), pool USDC (6 dp), and EURC.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ArcQuoteRow />
                {account ? <WalletAccountCard address={account.address} /> : null}
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-heading">Social profiles</CardTitle>
                <CardDescription>
                  ENS, Lens, and Farcaster for the connected address. OnceUpon identity is still X.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WalletSocialProfiles />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">NFT</CardTitle>
                <CardDescription>
                  Playground NFT media, name, and description. Cover art binds after the factory mints.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-sm text-parchment/60">
                  No Story cover contract on Arc testnet yet. The slot below is the same headless NFT
                  chrome launches will fill.
                </p>
                <div className="flex w-full max-w-[230px] flex-col gap-3 rounded-lg border border-gold/25 bg-card px-2 py-3">
                  <div className="flex h-40 items-center justify-center rounded-md bg-muted text-xs text-parchment/50">
                    Cover NFT
                  </div>
                  <p className="px-1 font-heading">Untitled Story</p>
                  <p className="px-1 text-sm text-parchment/70">Mints with the token, not before.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="buy" className="pt-4">
          <OnceUponBuyUsdc />
        </TabsContent>
        <TabsContent value="swap" className="pt-4">
          <OnceUponSwap />
        </TabsContent>
        <TabsContent value="bridge" className="pt-4">
          <OnceUponBridge />
        </TabsContent>
        <TabsContent value="checkout" className="pt-4">
          <OnceUponCheckout />
        </TabsContent>
        <TabsContent value="tx" className="space-y-6 pt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">TransactionButton</CardTitle>
                <CardDescription>Zero-value self-call on Arc until the factory is live.</CardDescription>
              </CardHeader>
              <CardContent>
                <OnceUponFaucetTx />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">TransactionWidget</CardTitle>
                <CardDescription>Fiat or crypto, then the on-chain action.</CardDescription>
              </CardHeader>
              <CardContent>
                <OnceUponTxWidget />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
