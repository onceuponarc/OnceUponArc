import type { PressCard, CardView } from "@/lib/cards/types";

export function cardValue(startPriceUi: number, startMcapUi: number, currentMcapUi: number) {
  const start = Math.max(1, startMcapUi);
  const now = Math.max(0, currentMcapUi);
  const multiple = now > 0 ? now / start : 1;
  return {
    multiple,
    valueUi: Math.max(0, startPriceUi * multiple),
  };
}

export function viewCard(card: PressCard, currentMcapUi?: number | null): CardView {
  const mcap = currentMcapUi && currentMcapUi > 0 ? currentMcapUi : card.startMcapUi;
  const priced = cardValue(card.startPriceUi, card.startMcapUi, mcap);
  return {
    ...card,
    currentMcapUi: mcap,
    multiple: priced.multiple,
    valueUi: priced.valueUi,
  };
}
