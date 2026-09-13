"use client";

import type { ReactNode } from "react";
import { SolanaWalletProvider } from "@/components/wallet/solana-wallet-provider";

export function Providers({ children }: { children: ReactNode }) {
  return <SolanaWalletProvider>{children}</SolanaWalletProvider>;
}
