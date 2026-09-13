"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Injected = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  publicKey?: { toBase58(): string } | null;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toBase58(): string } }>;
  disconnect?: () => Promise<void>;
  signTransaction: (tx: unknown) => Promise<unknown>;
  signMessage?: (message: Uint8Array) => Promise<{ signature: Uint8Array } | Uint8Array>;
};

type DetectedWallet = { id: string; name: string; provider: Injected };

function bytesToBase64(bytes: Uint8Array) {
  let bin = "";
  bytes.forEach((byte) => {
    bin += String.fromCharCode(byte);
  });
  return btoa(bin);
}

type WalletState = {
  wallets: DetectedWallet[];
  address: string | null;
  connecting: boolean;
  error: string | null;
  connect: (id?: string) => Promise<string | null>;
  disconnect: () => Promise<void>;
  signTransaction: (tx: unknown) => Promise<unknown>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
};

const empty: WalletState = {
  wallets: [],
  address: null,
  connecting: false,
  error: null,
  connect: async () => null,
  disconnect: async () => undefined,
  signTransaction: async () => {
    throw new Error("Connect a Solana wallet.");
  },
  signMessage: async () => {
    throw new Error("Connect a Solana wallet.");
  },
};

const WalletContext = createContext<WalletState>(empty);

function detect(): DetectedWallet[] {
  if (typeof window === "undefined") return [];
  const list: DetectedWallet[] = [];
  const phantom = (window as Window & { phantom?: { solana?: Injected } }).phantom?.solana;
  const solana = (window as Window & { solana?: Injected }).solana;
  const solflare = (window as Window & { solflare?: Injected }).solflare;
  const backpack = (window as Window & { backpack?: Injected }).backpack;
  const add = (id: string, name: string, provider?: Injected) => {
    if (provider && !list.some((item) => item.id === id)) list.push({ id, name, provider });
  };
  add("phantom", "Phantom", phantom ?? (solana?.isPhantom ? solana : undefined));
  add("solflare", "Solflare", solflare);
  add("backpack", "Backpack", backpack);
  return list;
}

async function bindToSupabase(address: string, signMessage: (msg: Uint8Array) => Promise<Uint8Array>) {
  const issuedAt = new Date().toISOString();
  const me = await fetch("/api/me").then((res) => res.json().catch(() => ({})));
  if (!me?.id) return;
  const message = new TextEncoder().encode(`OnceUpon:${me.id}:${issuedAt}`);
  const signature = await signMessage(message);
  const bytes = signature instanceof Uint8Array ? signature : new Uint8Array(signature as ArrayBuffer);
  await fetch("/api/wallets/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      address,
      issuedAt,
      signature: bytesToBase64(bytes),
    }),
  });
}

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<DetectedWallet[]>([]);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const scan = () => setWallets(detect());
    scan();
    const t = window.setInterval(scan, 2500);
    return () => window.clearInterval(t);
  }, []);

  const active = wallets.find((item) => item.id === activeId) ?? wallets[0];

  const signMessage = useCallback(
    async (message: Uint8Array) => {
      if (!active) throw new Error("Connect a Solana wallet.");
      if (!active.provider.signMessage) throw new Error("This wallet cannot sign a message.");
      const result = await active.provider.signMessage(message);
      if (result instanceof Uint8Array) return result;
      if (result && typeof result === "object" && "signature" in result) {
        return (result as { signature: Uint8Array }).signature;
      }
      throw new Error("Wallet did not return a signature.");
    },
    [active],
  );

  const connect = useCallback(
    async (id?: string) => {
      const target = (id ? wallets.find((item) => item.id === id) : wallets[0]) ?? detect()[0];
      if (!target) {
        setError("Install Phantom, Solflare, or Backpack.");
        return null;
      }
      setConnecting(true);
      setError(null);
      try {
        const result = await target.provider.connect({ onlyIfTrusted: false });
        const next = result.publicKey.toBase58();
        setActiveId(target.id);
        setAddress(next);
        await bindToSupabase(next, async (message) => {
          if (!target.provider.signMessage) throw new Error("This wallet cannot sign a message.");
          const signed = await target.provider.signMessage(message);
          if (signed instanceof Uint8Array) return signed;
          return (signed as { signature: Uint8Array }).signature;
        }).catch(() => undefined);
        return next;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wallet connect failed.");
        return null;
      } finally {
        setConnecting(false);
      }
    },
    [wallets],
  );

  const disconnect = useCallback(async () => {
    try {
      await active?.provider.disconnect?.();
    } catch {
      // ignore
    }
    setAddress(null);
    setActiveId(null);
  }, [active]);

  const signTransaction = useCallback(
    async (tx: unknown) => {
      if (!active) throw new Error("Connect a Solana wallet.");
      return active.provider.signTransaction(tx);
    },
    [active],
  );

  const value = useMemo(
    () => ({ wallets, address, connecting, error, connect, disconnect, signTransaction, signMessage }),
    [wallets, address, connecting, error, connect, disconnect, signTransaction, signMessage],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useSolanaWallet() {
  return useContext(WalletContext);
}
