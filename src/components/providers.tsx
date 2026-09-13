"use client";

import { SolanaWalletProvider } from "@/components/wallet/solana-wallet-provider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <SolanaWalletProvider>{children}</SolanaWalletProvider>;
}
