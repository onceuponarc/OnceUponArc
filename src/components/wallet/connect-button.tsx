"use client";

import { Button } from "@/components/ui/button";
import { useSolanaWallet } from "@/components/wallet/solana-wallet-provider";

function short(address: string) {
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function SolanaConnectButton({ compact = false }: { compact?: boolean }) {
  const { wallets, address, connecting, connect, disconnect, error } = useSolanaWallet();

  if (address) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void disconnect()}
        className="rounded-full border-arc/30 bg-arc/10 font-mono text-[11px] text-arc"
      >
        {short(address)}
      </Button>
    );
  }

  if (wallets.length <= 1) {
    return (
      <div className="flex flex-col items-end gap-1">
        <Button type="button" size="sm" onClick={() => void connect()} disabled={connecting} className="rounded-full">
          {connecting ? "Connecting…" : compact ? "Wallet" : "Connect wallet"}
        </Button>
        {error ? <p className="max-w-[14rem] text-right text-[10px] text-burgundy">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        {wallets.map((wallet) => (
          <Button
            key={wallet.id}
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full"
            onClick={() => void connect(wallet.id)}
            disabled={connecting}
          >
            {wallet.name}
          </Button>
        ))}
      </div>
      {error ? <p className="max-w-[14rem] text-right text-[10px] text-burgundy">{error}</p> : null}
    </div>
  );
}
