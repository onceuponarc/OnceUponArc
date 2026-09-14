import { ShareDeck } from "@/components/links/share-deck";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links",
  description: "OrbitX on Arc — X, Telegram updates, community. Website coming soon.",
  openGraph: {
    title: "OrbitX · links",
    description: "X, Telegram updates, community. Website on the press.",
    url: "/links",
  },
};

export default function LinksPage() {
  return <ShareDeck />;
}
