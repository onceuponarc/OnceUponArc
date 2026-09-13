"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { VersionedTransaction } from "@solana/web3.js";

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export type InjectedProvider = {
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  publicKey?: { toBase58(): string } | null;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toBase58(): string } } | void>;
  disconnect?: () => Promise<void>;
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
  signMessage?: (message: Uint8Array, encoding?: string) => Promise<Uint8Array | { signature: Uint8Array }>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  off?: (event: string, handler: (...args: unknown[]) => void) => void;
};

export type DetectedWallet = {
  id: string;
  name: string;
  provider: InjectedProvider;
};

type WalletState = {
  wallets: DetectedWallet[];
  wallet: DetectedWallet | null;
  address: string | null;
  connecting: boolean;
  error: string | null;
  connect: (id?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
  signMessage: (message: string) => Promise<string>;
};

const WalletContext = createContext<WalletState | null>(null);

function readWallets(): DetectedWallet[] {
  if (typeof window === "undefined") return [];
  const found: DetectedWallet[] = [];
  const seen = new Set<object>();
  const add = (id: string, name: string, provider: InjectedProvider | undefined) => {
    if (!provider || seen.has(provider)) return;
    seen.add(provider);
    found.push({ id, name, provider });
  };
  const phantom = (window as Window & { phantom?: { solana?: InjectedProvider } }).phantom?.solana;
  add("phantom", "Phantom", phantom ?? ((window.solana?.isPhantom ? window.solana : undefined) as InjectedProvider | undefined));
  add("solflare", "Solflare", (window as Window & { solflare?: InjectedProvider }).solflare);
  add("backpack", "Backpack", (window as Window & { backpack?: InjectedProvider }).backpack);
  return found;
}

export function SolanaWalletProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<DetectedWallet[]>([]);
  const [wallet, setWallet] = useState<DetectedWallet | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setWallets(readWallets());
    refresh();
    window.addEventListener("load", refresh);
    const timer = window.setTimeout(refresh, 400);
    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(timer);
    };
  }, []);

  const attach = useCallback((detected: DetectedWallet, publicKey: string) => {
    setWallet(detected);
    setAddress(publicKey);
    const onAccount = (...args: unknown[]) => {
      const next = args[0] as { toBase58?: () => string } | null;
      if (!next) {
        setAddress(null);
        setWallet(null);
        return;
      }
      if (typeof next.toBase58 === "function") setAddress(next.toBase58());
    };
    const onDisconnect = () => {
      setAddress(null);
      setWallet(null);
    };
    detected.provider.on?.("accountChanged", onAccount);
    detected.provider.on?.("disconnect", onDisconnect);
  }, []);

  const connect = useCallback(
    async (id?: string) => {
      setConnecting(true);
      setError(null);
      try {
        const available = readWallets();
        setWallets(available);
        const target = id ? available.find((item) => item.id === id) : available[0];
        if (!target) {
          throw new Error("Install Phantom, Solflare, or Backpack to connect.");
        }
        const result = await target.provider.connect();
        const publicKey =
          result && "publicKey" in result && result.publicKey
            ? result.publicKey.toBase58()
            : target.provider.publicKey?.toBase58();
        if (!publicKey) throw new Error("Wallet did not return a public key.");
        attach(target, publicKey);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not connect the wallet.");
        throw err;
      } finally {
        setConnecting(false);
      }
    },
    [attach],
  );

  const disconnect = useCallback(async () => {
    try {
      await wallet?.provider.disconnect?.();
    } finally {
      setWallet(null);
      setAddress(null);
    }
  }, [wallet]);

  const signTransaction = useCallback(
    async (tx: VersionedTransaction) => {
      if (!wallet) throw new Error("Connect a Solana wallet first.");
      return wallet.provider.signTransaction(tx);
    },
    [wallet],
  );

  const signMessage = useCallback(
    async (message: string) => {
      if (!wallet?.provider.signMessage) throw new Error("This wallet cannot sign messages.");
      const encoded = new TextEncoder().encode(message);
      const result = await wallet.provider.signMessage(encoded, "utf8");
      const bytes = result instanceof Uint8Array ? result : result.signature;
      return bytesToBase64(bytes);
    },
    [wallet],
  );

  const value = useMemo(
    () => ({
      wallets,
      wallet,
      address,
      connecting,
      error,
      connect,
      disconnect,
      signTransaction,
      signMessage,
    }),
    [wallets, wallet, address, connecting, error, connect, disconnect, signTransaction, signMessage],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useSolanaWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useSolanaWallet must run inside SolanaWalletProvider.");
  return ctx;
}
