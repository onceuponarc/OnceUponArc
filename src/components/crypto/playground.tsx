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
    <ClientOnly fallback={<div className="glass min-h-[24rem] rounded-2xl border border-gold/20" />}>
      <CryptoPlaygroundLive />
    </ClientOnly>
  );
}

function CryptoPlaygroundLive() {
  const account = useActiveAccount();

  return (
    <div className="space-y-8">
      <Tabs defaultValue="connect">
        <TabsList className="glass flex h-auto flex-wrap rounded-full border border-gold/20 p-1">
          <TabsTrigger value="connect" className="rounded-full">
            Connect
          </TabsTrigger>
          <TabsTrigger value="buy" className="rounded-full">
            Buy USDC
          </TabsTrigger>
          <TabsTrigger value="swap" className="rounded-full">
            Swap
          </TabsTrigger>
          <TabsTrigger value="bridge" className="rounded-full">
            Bridge
          </TabsTrigger>
          <TabsTrigger value="more" className="rounded-full">
            More
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connect" className="space-y-6 pt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Wallet</CardTitle>
                <CardDescription>
                  Same control as the header. Arc-only wallets. Identity stays X.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <OnceUponConnectButton />
                {account ? <WalletAccountCard address={account.address} /> : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Inline connect</CardTitle>
                <CardDescription>Drop a wallet in without leaving the pad.</CardDescription>
              </CardHeader>
              <CardContent>
                <OnceUponConnectEmbed />
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
        <TabsContent value="more" className="space-y-6 pt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quotes on Arc</CardTitle>
                <CardDescription>Native gas USDC (18 dp), pool USDC (6 dp), and EURC.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ArcQuoteRow />
                <HeadlessArcConnect />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
                <CardDescription>Fiat or crypto into the pad. Not a Story purchase.</CardDescription>
              </CardHeader>
              <CardContent>
                <OnceUponCheckout />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Ping Arc</CardTitle>
                <CardDescription>Zero-value self-call until the factory is live.</CardDescription>
              </CardHeader>
              <CardContent>
                <OnceUponFaucetTx />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Send</CardTitle>
                <CardDescription>Fiat or crypto, then the on-chain action.</CardDescription>
              </CardHeader>
              <CardContent>
                <OnceUponTxWidget />
              </CardContent>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Address socials</CardTitle>
                <CardDescription>
                  ENS, Lens, and Farcaster for the connected wallet. OnceUpon identity is still X.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WalletSocialProfiles />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
