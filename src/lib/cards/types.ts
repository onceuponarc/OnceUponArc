export const CARD_FLYWHEELS = [
  {
    id: "creator",
    label: "Creator cut",
    hint: "100% of the card price goes to the creator wallet. Token fees stay on the Chapter.",
  },
  {
    id: "split",
    label: "Creator + desk",
    hint: "90% creator, 10% OrbitX desk. Token still trades on its own curve.",
  },
  {
    id: "burn",
    label: "Winner burn",
    hint: "Card price tracks MC. Weekly winner still uses the 5% pad burn.",
  },
  {
    id: "tweet",
    label: "Tweet only",
    hint: "No coin required. Card is the product. Price stays at start until you pair a Chapter.",
  },
  {
    id: "pair",
    label: "Paired Chapter",
    hint: "Jacket tracks the linked token MC. Coin tape stays on the curve.",
  },
] as const;

export type CardFlywheel = (typeof CARD_FLYWHEELS)[number]["id"];

export type PressCard = {
  id: string;
  slug: string;
  title: string;
  ticker: string;
  blurb: string;
  tweetUrl: string | null;
  tweetId: string | null;
  tweetHandle: string | null;
  coverUrl: string | null;
  startPriceUi: number;
  startMcapUi: number;
  flywheel: CardFlywheel;
  storySlug: string | null;
  creatorHandle: string;
  creatorPayAddress: string;
  payNetwork: "arc" | "solana";
  ownerHandle: string;
  listed: boolean;
  lastPayTx: string | null;
  createdAt: string;
  nftMint: string | null;
  pressNumber: number | null;
  rarity: string;
  editionIndex: number;
  editionTotal: number;
  visibility: "public" | "hidden";
};

export const OFFER_STATES = [
  "draft",
  "open",
  "accepted",
  "payment_pending",
  "payment_detected",
  "payment_confirmed",
  "transfer_pending",
  "transfer_confirmed",
  "completed",
  "declined",
  "expired",
  "cancelled",
  "failed",
] as const;
export type OfferStatus = (typeof OFFER_STATES)[number];

export type PressOffer = {
  id: string;
  cardSlug: string;
  buyerHandle: string;
  sellerHandle: string;
  offerAmountUi: number;
  paymentMint: string | null;
  status: OfferStatus;
  txSignature: string | null;
  failReason: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

export type PressActivity = {
  id: string;
  cardSlug: string;
  kind: string;
  detail: Record<string, unknown>;
  txSignature: string | null;
  createdAt: string;
};

export function pressId(n: number | null): string {
  if (!n) return "PX-??????";
  return `PX-${String(n).padStart(6, "0")}`;
}

export type CardView = PressCard & {
  currentMcapUi: number;
  multiple: number;
  valueUi: number;
};
