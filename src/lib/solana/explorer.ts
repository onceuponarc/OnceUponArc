import { SOLANA } from "@onceupon/config/solana";

function explorerQuery(): string {
  return SOLANA.cluster === "mainnet-beta" ? "" : `?cluster=${SOLANA.cluster}`;
}

export function explorerTx(signature: string): string {
  return `${SOLANA.explorer}/tx/${signature}${explorerQuery()}`;
}

export function explorerAddress(address: string): string {
  return `${SOLANA.explorer}/address/${address}${explorerQuery()}`;
}
