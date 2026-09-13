export function formatUsd(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `$${(value / 1_000).toFixed(1)}k`;
  if (abs >= 1_000) return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (abs >= 1) return `$${value.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
  if (abs === 0) return "$0.00";
  return `$${value.toPrecision(3)}`;
}

export function formatPct(value: number): string {
  if (!Number.isFinite(value)) return "0.00%";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const sec = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (sec < 60) return `${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `${hr}h`;
  return `${Math.round(hr / 24)}d`;
}

export function shortenAddress(address: string, size = 4): string {
  if (!address) return "";
  if (address.length <= size * 2 + 2) return address;
  return `${address.slice(0, size + (address.startsWith("0x") ? 2 : 0))}…${address.slice(-size)}`;
}
