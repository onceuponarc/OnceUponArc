export const MARKET_EVENT = "onceupon:market";

export function pingMarket() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(MARKET_EVENT));
}
