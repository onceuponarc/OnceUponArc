import { JUPITER, SOLANA } from "@onceupon/config/solana";

export function JupiterStatusRow() {
  return (
    <p className="text-xs text-parchment/55">
      Swaps route through{" "}
      <a className="text-gold hover:underline" href={JUPITER.app} target="_blank" rel="noreferrer">
        Jupiter
      </a>{" "}
      on {SOLANA.name}.
    </p>
  );
}
