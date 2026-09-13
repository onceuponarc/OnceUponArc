export {};

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      publicKey?: { toBase58(): string } | null;
      connect: () => Promise<{ publicKey: { toBase58(): string } } | void>;
      disconnect?: () => Promise<void>;
      signTransaction: <T>(tx: T) => Promise<T>;
      signMessage?: (message: Uint8Array, encoding?: string) => Promise<Uint8Array | { signature: Uint8Array }>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      off?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
    phantom?: { solana?: Window["solana"] };
    solflare?: Window["solana"];
    backpack?: Window["solana"];
  }
}
