"use client";

import { ClientOnly } from "@/components/client-only";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSolanaWallet } from "@/components/wallet/solana-wallet-provider";

function shorten(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

function ConnectLive() {
  const { wallets, address, connecting, connect, disconnect, error } = useSolanaWallet();

  if (address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="font-mono text-xs">
            {shorten(address)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="font-mono text-xs">{address}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => void disconnect()}>Disconnect</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (!wallets.length) {
    return (
      <Button size="sm" variant="outline" asChild>
        <a href="https://phantom.app" target="_blank" rel="noreferrer">
          Get a wallet
        </a>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" disabled={connecting}>
          {connecting ? "Connecting…" : "Connect"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Solana wallet</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {wallets.map((item) => (
          <DropdownMenuItem key={item.id} onClick={() => void connect(item.id)}>
            {item.name}
          </DropdownMenuItem>
        ))}
        {error ? <p className="px-2 py-1 text-xs text-destructive">{error}</p> : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SolanaConnectButton() {
  return (
    <ClientOnly
      fallback={
        <span className="inline-block h-8 min-w-[88px] rounded-md border border-gold/20 bg-card" aria-hidden />
      }
    >
      <ConnectLive />
    </ClientOnly>
  );
}
